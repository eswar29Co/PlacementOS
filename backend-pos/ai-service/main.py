from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import random
import re
import nltk
import time
import logging
import spacy
import numpy as np
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from sentence_transformers import SentenceTransformer, util
from textblob import TextBlob

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ai-service")

# Initialize NLTK
def setup_nltk():
    resources = [
        ('tokenizers/punkt', 'punkt'),
        ('corpora/stopwords', 'stopwords'),
        ('corpora/wordnet', 'wordnet'),
        ('tokenizers/punkt_tab', 'punkt_tab')
    ]
    for res_path, res_name in resources:
        try:
            nltk.data.find(res_path)
        except LookupError:
            logger.info(f"Downloading NLTK resource {res_name}...")
            nltk.download(res_name)

setup_nltk()

# Load Advanced ML Models
try:
    logger.info("Loading Spacy and SentenceTransformer models...")
    nlp = spacy.load("en_core_web_sm")
    # Using a fast but accurate model for semantic similarity
    similarity_model = SentenceTransformer('all-MiniLM-L6-v2')
    logger.info("ML Models loaded successfully.")
except Exception as e:
    logger.error(f"Failed to load ML models: {e}")
    nlp = None
    similarity_model = None

app = FastAPI(title="PlacementOS AI Service", description="Advanced AI service for ATS and Interview Analysis")

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    logger.info(f"Path: {request.url.path} Method: {request.method} Time: {process_time:.4f}s Status: {response.status_code}")
    return response

class ATSRequest(BaseModel):
    resume_text: str
    job_description: str
    skills_required: List[str]

class InterviewRequest(BaseModel):
    answers: List[str]
    context: Optional[str] = None

def clean_text(text: str) -> str:
    if not text:
        return ""
    # Remove special characters and numbers for cleaner NLP
    text = re.sub(r'[^a-zA-Z\s]', ' ', text)
    return " ".join(text.split())

def extract_entities(text: str):
    if not nlp:
        return []
    doc = nlp(text)
    # Extract organizations, skills-like nouns, and proper nouns
    entities = [ent.text for ent in doc.ents if ent.label_ in ["ORG", "PRODUCT", "GPE"]]
    # Also include high-frequency nouns as potential skills if not in entities
    potential_skills = [token.text for token in doc if token.pos_ in ["PROPN", "NOUN"] and len(token.text) > 2]
    return list(set(entities + potential_skills))

@app.get("/health")
async def health_check():
    return {
        "status": "healthy", 
        "models_loaded": nlp is not None and similarity_model is not None,
        "timestamp": time.time()
    }

@app.post("/ats/analyze")
async def analyze_ats(request: ATSRequest):
    try:
        if not request.resume_text or not request.job_description:
            raise HTTPException(status_code=400, detail="Resume text and job description are required")

        # 1. Advanced Keywork Matching using NER and regex
        resume_lower = request.resume_text.lower()
        matched_skills = []
        for s in request.skills_required:
            # Word boundary regex for exact skill matching
            if re.search(r'\b' + re.escape(s.lower()) + r'\b', resume_lower):
                matched_skills.append(s)
        
        missing_skills = [s for s in request.skills_required if s not in matched_skills]
        keyword_score = (len(matched_skills) / len(request.skills_required)) * 100 if request.skills_required else 80

        # 2. Advanced Semantic Matching
        if similarity_model:
            # Compute embeddings for entire blocks
            embeddings = similarity_model.encode([request.resume_text, request.job_description])
            semantic_score = float(util.cos_sim(embeddings[0], embeddings[1])[0][0]) * 100
        else:
            semantic_score = 50 # Fallback

        # 3. Structural Analysis (Formatting)
        has_contact = bool(re.search(r'[\w\.-]+@[\w\.-]+\.\w+', request.resume_text))
        has_phone = bool(re.search(r'(\d{3}[-\.\s]??\d{3}[-\.\s]??\d{4}|\(\d{3}\)\s*\d{3}[-\.\s]??\d{4}|\d{10})', request.resume_text))
        
        # 4. Readability
        words = request.resume_text.split()
        char_count = len(request.resume_text)
        word_count = len(words)
        
        # 5. Final weighted score
        final_score = round((keyword_score * 0.5) + (semantic_score * 0.5))
        final_score = min(100, max(0, final_score))

        # Generate summary
        if final_score > 80:
            summary = "Excellent match! Your profile strongly aligns with the technical and contextual requirements."
        elif final_score > 60:
            summary = "Good match. You have the core skills, but consider highlighting missing keywords for a better impact."
        else:
            summary = "Moderate alignment. Your resume might need more specific details related to the job description."

        return {
            "score": final_score,
            "matching_skills": matched_skills,
            "missing_skills": missing_skills,
            "summary": summary,
            "semantic_match": round(semantic_score),
            "hasContactInfo": has_contact and has_phone,
            "readability": {
                "charCount": char_count,
                "wordCount": word_count
            }
        }
    except Exception as e:
        logger.error(f"ATS analysis failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/interview/summarize")
async def summarize_interview(request: InterviewRequest):
    try:
        valid_answers = [a for a in request.answers if a and len(a.strip()) > 10]
        if not valid_answers:
             return {
                "summary": "No substantial responses provided for analysis.",
                "score": 0,
                "metrics": {"tone": "N/A", "depth": "N/A", "avg_length": 0, "sentiment_polarity": 0}
            }

        total_sentiment = 0
        word_count = 0
        sentiments = []

        for answer in valid_answers:
            blob = TextBlob(answer)
            sentiments.append(blob.sentiment.polarity)
            total_sentiment += blob.sentiment.polarity
            word_count += len(answer.split())

        avg_sentiment = total_sentiment / len(valid_answers)
        avg_length = word_count / len(valid_answers)

        # Scoring
        sentiment_mod = (avg_sentiment + 1) * 50 # 0-100
        length_mod = min(100, (avg_length / 40) * 100)
        
        final_score = round((sentiment_mod * 0.3) + (length_mod * 0.7))
        final_score = min(100, max(10, final_score))

        # Insights
        tone = "Professional & Positive" if avg_sentiment > 0.15 else "Direct & Neutral"
        depth = "High" if avg_length > 50 else "Moderate" if avg_length > 25 else "Concise"
        
        # Use Spacy for technical keyword extraction from answers
        tech_keywords = []
        if nlp:
            full_transcript = " ".join(valid_answers)
            doc = nlp(full_transcript)
            tech_keywords = [token.text for token in doc if token.pos_ in ["PROPN"] and len(token.text) > 2]
            tech_keywords = list(set(tech_keywords[:5])) # Top 5

        summary = f"The candidate demonstrated {depth.lower()} depth in responses with a {tone.lower()} tone. "
        if tech_keywords:
            summary += f"Key topics discussed: {', '.join(tech_keywords)}. "
        
        return {
            "summary": summary,
            "score": final_score,
            "metrics": {
                "tone": tone,
                "depth": depth,
                "avg_length": round(avg_length),
                "sentiment_polarity": round(avg_sentiment, 2),
                "key_topics": tech_keywords
            }
        }
    except Exception as e:
        logger.error(f"Interview summary failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

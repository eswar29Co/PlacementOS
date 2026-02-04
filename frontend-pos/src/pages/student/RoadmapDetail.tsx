import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronRight,
    ArrowLeft,
    Code,
    Database,
    Globe,
    Cpu,
    Brain,
    Layers,
    Server,
    Terminal,
    Workflow,
    Cloud,
    Rocket,
    Search,
    BookOpen,
    Award,
    ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface RoadmapStep {
    title: string;
    description: string;
    details: string[];
    icon: any;
    color: string;
}

interface Roadmap {
    title: string;
    subtitle: string;
    description: string;
    steps: RoadmapStep[];
}

const roadmapsData: Record<string, Roadmap> = {
    'python-full-stack': {
        title: 'Python Full Stack',
        subtitle: 'From Basics to Enterprise Apps',
        description: 'Master the versatility of Python for both frontend and backend development.',
        steps: [
            {
                title: 'Frontend Fundamentals',
                description: 'Master the core web technologies.',
                details: ['HTML5 & Semantic Elements', 'CSS3 Transitions & Flexbox', 'JavaScript ES6+', 'React Fundamentals'],
                icon: Globe,
                color: 'from-blue-400 to-blue-600'
            },
            {
                title: 'Python Mastery',
                description: 'Deep dive into the Python language.',
                details: ['Core Syntax & Data Types', 'Functional Programming', 'Object Oriented Programming', 'Asynchronous Programming (asyncio)'],
                icon: Terminal,
                color: 'from-yellow-400 to-yellow-600'
            },
            {
                title: 'Backend with Django/Flask',
                description: 'Build robust APIs and server-side logic.',
                details: ['Restful API Design', 'Django ORM & Models', 'Flask Microservices', 'Authentication & JWT'],
                icon: Server,
                color: 'from-green-400 to-green-600'
            },
            {
                title: 'Databases & Performance',
                description: 'Scale your data management.',
                details: ['PostgreSQL & SQL Performance', 'Redis Caching', 'NoSQL with MongoDB', 'Database Indexing'],
                icon: Database,
                color: 'from-indigo-400 to-indigo-600'
            },
            {
                title: 'Deployment & CI/CD',
                description: 'Release your application to the world.',
                details: ['Docker & Containerization', 'GitHub Actions CI/CD', 'AWS/Heroku Deployment', 'Monitoring with Prometheus'],
                icon: Rocket,
                color: 'from-purple-400 to-purple-600'
            }
        ]
    },
    'java-full-stack': {
        title: 'Java Full Stack',
        subtitle: 'Enterprise-Grade Engineering',
        description: 'Build high-performance, scalable enterprise systems using Java and modern JS.',
        steps: [
            {
                title: 'Modern Frontend',
                description: 'Build reactive user interfaces.',
                details: ['React or Angular Core', 'State Management (Redux/NgRx)', 'TypeScript Deep Dive', 'Component-Driven Development'],
                icon: Layers,
                color: 'from-red-400 to-red-600'
            },
            {
                title: 'Java Ecosystem',
                description: 'The backbone of enterprise software.',
                details: ['Java 17+ Features', 'Spring Boot 3.x', 'Spring Security', 'Maven/Gradle Build Tools'],
                icon: Code,
                color: 'from-orange-400 to-orange-600'
            },
            {
                title: 'Microservices Architecture',
                description: 'Designing distributed systems.',
                details: ['Service Discovery (Eureka)', 'API Gateway', 'Kafka Event Streaming', 'Resilience with Resilience4j'],
                icon: Workflow,
                color: 'from-cyan-400 to-cyan-600'
            },
            {
                title: 'Persistence Layer',
                description: 'Reliable data storage.',
                details: ['Hibernate & JPA', 'Spring Data JPA', 'Optimistic Locking', 'Hibernate Envers'],
                icon: Database,
                color: 'from-blue-400 to-blue-600'
            },
            {
                title: 'Cloud Native',
                description: 'Deploy at scale.',
                details: ['Cloud Foundry or Azure', 'Kubernetes Orchestration', 'Jenkins Pipelines', 'Cloud Native Buildpacks'],
                icon: Cloud,
                color: 'from-sky-400 to-sky-600'
            }
        ]
    },
    'mern-stack': {
        title: 'MERN Stack',
        subtitle: 'Full-Stack JavaScript Mastery',
        description: 'The complete guide to becoming a high-demand JS developer.',
        steps: [
            {
                title: 'Frontend Mastery',
                description: 'Create stunning UI/UX.',
                details: ['Advanced React Patterns', 'Tailwind CSS Mastery', 'Framer Motion Animations', 'React Query / SWR'],
                icon: Globe,
                color: 'from-cyan-400 to-cyan-600'
            },
            {
                title: 'Node.js & Express',
                description: 'Efficient backend runtime.',
                details: ['Event Loop & Performance', 'Middleware Architecture', 'File Uploads with Multer', 'Socket.io Real-time'],
                icon: Terminal,
                color: 'from-emerald-400 to-emerald-600'
            },
            {
                title: 'MongoDB Schema Design',
                description: 'NoSQL Data Modeling.',
                details: ['Mongoose Schemas', 'Aggregation Pipelines', 'Indexing Strategies', 'Atlas Search'],
                icon: Database,
                color: 'from-green-500 to-green-700'
            },
            {
                title: 'Security & Auth',
                description: 'Hardening your application.',
                details: ['Passport.js & JWT', 'OAuth Integration', 'Bcrypt Hashing', 'Helmet.js Security'],
                icon: Cpu,
                color: 'from-rose-400 to-rose-600'
            },
            {
                title: 'Modern DevOps',
                description: 'Full Automation.',
                details: ['Docker Compose', 'DigitalOcean/Vercel', 'E2E Testing (Cypress)', 'Automated Unit Tests'],
                icon: Rocket,
                color: 'from-indigo-400 to-indigo-600'
            }
        ]
    },
    'data-engineer': {
        title: 'Data Engineer',
        subtitle: 'Architecting the Future of Data',
        description: 'Transform raw data into valuable engineering assets.',
        steps: [
            {
                title: 'SQL & Data Modeling',
                description: 'The foundation of data.',
                details: ['Advanced SQL Queries', 'Star & Snowflake Schemas', 'Database Normalization', 'Window Functions'],
                icon: Database,
                color: 'from-amber-400 to-amber-600'
            },
            {
                title: 'Python for Data',
                description: 'Processing big data efficiently.',
                details: ['Pandas & NumPy', 'PySpark for Big Data', 'Object Serialization', 'Concurrency (Dask)'],
                icon: Terminal,
                color: 'from-blue-400 to-blue-600'
            },
            {
                title: 'ETL Pipelines',
                description: 'Moving data at scale.',
                details: ['Apache Airflow', 'DBT (Data Build Tool)', 'Glue / Data Factory', 'Incremental Loading'],
                icon: Workflow,
                color: 'from-orange-400 to-orange-600'
            },
            {
                title: 'Distributed Systems',
                description: 'Processing petabytes.',
                details: ['Hadoop & HDFS', 'Apache Kafka Streaming', 'Apache Spark internals', 'Parquet/Avra Formats'],
                icon: Layers,
                color: 'from-indigo-400 to-indigo-600'
            },
            {
                title: 'Data Warehousing',
                description: 'Optimized analysis.',
                details: ['Snowflake Architecture', 'AWS Redshift', 'Google BigQuery', 'Lakehouse Systems'],
                icon: Cloud,
                color: 'from-violet-400 to-violet-600'
            }
        ]
    },
    'ai-engineer': {
        title: 'AI Engineer',
        subtitle: 'From Theory to Generative AI',
        description: 'Master the art of building intelligent software.',
        steps: [
            {
                title: 'Math & Python Mastery',
                description: 'The core foundations.',
                details: ['Linear Algebra & Calculus', 'NumPy for Tensors', 'Optimization Theory', 'Gradient Descent Foundations'],
                icon: Code,
                color: 'from-indigo-400 to-indigo-600'
            },
            {
                title: 'Deep Learning',
                description: 'Building neural systems.',
                details: ['PyTorch or TensorFlow', 'Neural Network Architectures', 'Backpropagation', 'Hyperparameter Tuning'],
                icon: Brain,
                color: 'from-purple-400 to-purple-600'
            },
            {
                title: 'Natural Language Processing',
                description: 'Understanding human language.',
                details: ['RNNs & LSTMs', 'Transformers & Attention', 'Word Embeddings (Word2Vec)', 'Text Classification'],
                icon: Search,
                color: 'from-cyan-400 to-cyan-600'
            },
            {
                title: 'Large Language Models',
                description: 'The cutting edge.',
                details: ['Building GPT-like Models', 'Fine-tuning Strategies', 'RAG (Retrieval Augmentation)', 'Vector Databases (Pinecone)'],
                icon: Layers,
                color: 'from-pink-400 to-pink-600'
            },
            {
                title: 'AI in Production',
                description: 'Serving models at scale.',
                details: ['FastAPI for AI Models', 'Inferencing Optimization', 'Quantization (ONNX)', 'Scalable Inference (Ray)'],
                icon: Rocket,
                color: 'from-emerald-400 to-emerald-600'
            }
        ]
    },
    'ml-engineer': {
        title: 'ML Engineer',
        subtitle: 'Production-Ready Machine Learning',
        description: 'The bridge between data science and robust software.',
        steps: [
            {
                title: 'Statistical Learning',
                description: 'Classical algorithms.',
                details: ['Linear/Logistic Regression', 'Random Forests & XGBoost', 'SVMs & K-Means', 'Cross-Validation Techniques'],
                icon: BookOpen,
                color: 'from-blue-400 to-blue-600'
            },
            {
                title: 'Feature Engineering',
                description: 'The secret to good models.',
                details: ['Target Encoding', 'Dimensionality Reduction (PCA)', 'Feature Scaling', 'Handling Data Drift'],
                icon: Search,
                color: 'from-orange-400 to-orange-600'
            },
            {
                title: 'Deep Learning Systems',
                description: 'Specialized architectures.',
                details: ['CNNs for Imaging', 'Autoencoders', 'Generative Adversarial Nets', 'Transfer Learning'],
                icon: Brain,
                color: 'from-red-400 to-red-600'
            },
            {
                title: 'MLOps & Pipelines',
                description: 'Automating the ML lifecycle.',
                details: ['MLflow for Tracking', 'DVC (Data Version Control)', 'Kubeflow Pipelines', 'Model Monitoring'],
                icon: Workflow,
                color: 'from-indigo-400 to-indigo-600'
            },
            {
                title: 'Scalable ML Deployment',
                description: 'Serving millions.',
                details: ['BentoML or Seldon', 'Triton Inference Server', 'Edge AI Deployment', 'Distributed Training'],
                icon: Rocket,
                color: 'from-emerald-400 to-emerald-600'
            }
        ]
    }
};

export default function RoadmapDetail() {
    const { type } = useParams<{ type: string }>();
    const navigate = useNavigate();
    const [currentType, setCurrentType] = useState<string>(type || 'python-full-stack');
    const [hoveredStep, setHoveredStep] = useState<number | null>(null);

    useEffect(() => {
        if (type) {
            setCurrentType(type);
        }
    }, [type]);

    const roadmap = roadmapsData[currentType];

    const handleTypeChange = (value: string) => {
        setCurrentType(value);
        navigate(`/student/roadmaps/${value}`);
    };

    if (!roadmap) {
        return (
            <DashboardLayout title="Roadmaps" subtitle="Career progression paths">
                <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
                    <p className="text-xl font-bold text-slate-400 uppercase tracking-widest">Roadmap Not Found</p>
                    <Button onClick={() => navigate('/student/home')} variant="outline">Back to Home</Button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Career Roadmaps" subtitle="Master the skills required for high-demand tech roles.">
            <div className="max-w-7xl mx-auto px-4 py-4 relative">

                {/* Roadmap Selector Dropdown */}
                <div className="mb-10 flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm relative z-50">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                            <Workflow className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Currently Viewing</p>
                            <h4 className="text-xl font-black text-slate-900 uppercase tracking-tighter leading-none">{roadmap.title}</h4>
                        </div>
                    </div>

                    <div className="w-full md:w-72">
                        <Select value={currentType} onValueChange={handleTypeChange}>
                            <SelectTrigger className="w-full h-14 rounded-2xl border-slate-200 bg-slate-50 font-bold text-slate-700 shadow-none focus:ring-primary/20">
                                <SelectValue placeholder="Select Roadmap" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-slate-200 shadow-xl p-2">
                                {Object.keys(roadmapsData).map((key) => (
                                    <SelectItem
                                        key={key}
                                        value={key}
                                        className="rounded-xl font-bold py-3 text-slate-600 focus:bg-primary/5 focus:text-primary"
                                    >
                                        {roadmapsData[key].title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Header section with glassmorphism */}
                <motion.div
                    key={currentType + '-header'}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative mb-16 p-12 rounded-[3.5rem] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden shadow-2xl"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Cpu className="w-64 h-64 rotate-12" />
                    </div>

                    <div className="relative z-10">
                        <div className="flex flex-col gap-4 max-w-3xl">
                            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-primary/20 border border-primary/20 text-primary-foreground text-[10px] font-black uppercase tracking-[0.2em] mb-2 w-fit">
                                <Award className="w-3 h-3" /> Verified Career Path
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none mb-2 uppercase">
                                {roadmap.title.split(' ')[0]} <span className="text-primary">{roadmap.title.split(' ').slice(1).join(' ')}</span>
                            </h1>
                            <p className="text-2xl font-bold text-white/50 tracking-tight leading-snug">
                                {roadmap.subtitle} — {roadmap.description}
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Modern Roadmap Timeline */}
                <div className="relative">
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-slate-200 to-transparent transform -translate-x-1/2 hidden md:block" />

                    <div className="space-y-12 relative">
                        {roadmap.steps.map((step, index) => {
                            const Icon = step.icon;
                            const isEven = index % 2 === 0;

                            return (
                                <motion.div
                                    key={currentType + index}
                                    initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                    className={cn(
                                        "flex flex-col md:flex-row items-center gap-8 md:gap-0",
                                        isEven ? "md:flex-row" : "md:flex-row-reverse"
                                    )}
                                    onMouseEnter={() => setHoveredStep(index)}
                                    onMouseLeave={() => setHoveredStep(null)}
                                >
                                    {/* Visual Content */}
                                    <div className="flex-1 w-full md:px-16">
                                        <div className={cn(
                                            "p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/40 group hover:border-primary/30 transition-all duration-500 relative cursor-default",
                                            hoveredStep === index ? "scale-[1.03] shadow-2xl" : "scale-100"
                                        )}>
                                            <div className="flex items-start gap-6 mb-6">
                                                <div className={cn(
                                                    "h-14 w-14 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0 transition-transform duration-500 group-hover:rotate-6 bg-gradient-to-br",
                                                    step.color
                                                )}>
                                                    <Icon className="w-7 h-7" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Step {index + 1}</p>
                                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none uppercase">{step.title}</h3>
                                                </div>
                                            </div>

                                            <p className="text-slate-500 font-bold mb-6">{step.description}</p>

                                            {/* Hover Content Section with Animation */}
                                            <AnimatePresence>
                                                {hoveredStep === index && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="overflow-hidden border-t border-slate-100 pt-6 mt-6"
                                                    >
                                                        <div className="grid grid-cols-1 gap-3 px-2 pb-2">
                                                            {step.details.map((detail, dIdx) => (
                                                                <div key={dIdx} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 group-hover/item:bg-primary/5 transition-colors">
                                                                    <div className="h-2 w-2 rounded-full bg-primary/40" />
                                                                    <span className="text-sm font-bold text-slate-700 tracking-tight">{detail}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>

                                    {/* Central Circle */}
                                    <div className="relative flex items-center justify-center">
                                        <div className={cn(
                                            "h-10 w-10 md:h-14 md:w-14 rounded-full border-4 border-white bg-white shadow-xl z-20 flex items-center justify-center transition-all duration-500",
                                            hoveredStep === index ? "bg-primary text-white scale-125" : "bg-white text-slate-300"
                                        )}>
                                            <ChevronRight className={cn("w-5 h-5 transition-all", hoveredStep === index ? "translate-x-0.5" : "")} />
                                        </div>
                                    </div>

                                    {/* Spacing for layout balance */}
                                    <div className="flex-1 hidden md:block" />
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer Call to Action */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="mt-24 p-12 text-center bg-slate-50 rounded-[3rem] border border-dashed border-slate-200"
                >
                    <h2 className="text-3xl font-black text-slate-900 uppercase mb-4">Ready to start this <span className="text-primary">Journey?</span></h2>
                    <p className="text-slate-500 font-bold max-w-xl mx-auto mb-8 uppercase tracking-widest text-xs">Click on any step to dive deeper into the modules and recommended resources.</p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Button className="h-14 px-8 rounded-full font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20">Start Learning Now</Button>
                        <Button variant="outline" className="h-14 px-8 rounded-full font-black uppercase text-xs tracking-widest">Download Syllabus</Button>
                    </div>
                </motion.div>
            </div>
        </DashboardLayout>
    );
}

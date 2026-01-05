package com.placementos.repository;

import com.placementos.model.Interview;
import com.placementos.model.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface InterviewRepository extends JpaRepository<Interview, Long> {
    Optional<Interview> findByApplication(Application application);
    List<Interview> findByVerdict(Interview.Verdict verdict);
}

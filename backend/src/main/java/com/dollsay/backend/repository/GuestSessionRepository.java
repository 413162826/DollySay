package com.dollsay.backend.repository;

import com.dollsay.backend.model.GuestSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GuestSessionRepository extends JpaRepository<GuestSession, String> {
}

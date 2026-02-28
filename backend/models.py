from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class Client(Base):
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    company = Column(String, nullable=False)
    email = Column(String)
    phone = Column(String)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    jobs = relationship("Job", back_populates="client")


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    company = Column(String, nullable=False)
    location = Column(String)
    budget_min = Column(Integer)
    budget_max = Column(Integer)
    experience_min = Column(Integer)
    experience_max = Column(Integer)
    skills = Column(Text)
    status = Column(String, default="Active")
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    client_id = Column(Integer, ForeignKey("clients.id"))

    client = relationship("Client", back_populates="jobs")
    pipeline = relationship("Pipeline", back_populates="job")


class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String)
    phone = Column(String)
    location = Column(String)
    experience_years = Column(Integer)
    current_company = Column(String)
    current_ctc = Column(String)
    expected_ctc = Column(String)
    notice_period = Column(String)
    skills = Column(Text)
    linkedin_url = Column(String)
    cv_path = Column(String)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    pipeline = relationship("Pipeline", back_populates="candidate")


class Pipeline(Base):
    __tablename__ = "pipeline"

    id = Column(Integer, primary_key=True, index=True)
    stage = Column(String, default="Sourced")
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    candidate_id = Column(Integer, ForeignKey("candidates.id"))
    job_id = Column(Integer, ForeignKey("jobs.id"))

    candidate = relationship("Candidate", back_populates="pipeline")
    job = relationship("Job", back_populates="pipeline")
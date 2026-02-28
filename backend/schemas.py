from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# Client Schemas
class ClientBase(BaseModel):
    name: str
    company: str
    email: Optional[str] = None
    phone: Optional[str] = None
    notes: Optional[str] = None

class ClientCreate(ClientBase):
    pass

class ClientResponse(ClientBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True


# Job Schemas
class JobBase(BaseModel):
    title: str
    company: str
    location: Optional[str] = None
    budget_min: Optional[int] = None
    budget_max: Optional[int] = None
    experience_min: Optional[int] = None
    experience_max: Optional[int] = None
    skills: Optional[str] = None
    status: Optional[str] = "Active"
    notes: Optional[str] = None
    client_id: Optional[int] = None

class JobCreate(JobBase):
    pass

class JobResponse(JobBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True


# Candidate Schemas
class CandidateBase(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    experience_years: Optional[int] = None
    current_company: Optional[str] = None
    current_ctc: Optional[str] = None
    expected_ctc: Optional[str] = None
    notice_period: Optional[str] = None
    skills: Optional[str] = None
    linkedin_url: Optional[str] = None
    notes: Optional[str] = None

class CandidateCreate(CandidateBase):
    pass

class CandidateResponse(CandidateBase):
    id: int
    cv_path: Optional[str] = None
    created_at: datetime
    class Config:
        from_attributes = True


# Pipeline Schemas
class PipelineBase(BaseModel):
    stage: Optional[str] = "Sourced"
    notes: Optional[str] = None
    candidate_id: int
    job_id: int

class PipelineCreate(PipelineBase):
    pass

class PipelineResponse(PipelineBase):
    id: int
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True
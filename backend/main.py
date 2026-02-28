from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import shutil
import os

from . import models, schemas
from .database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Kushagra ATS")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"

# ─── CLIENTS ───────────────────────────────────────────────
@app.post("/clients/", response_model=schemas.ClientResponse)
def create_client(client: schemas.ClientCreate, db: Session = Depends(get_db)):
    db_client = models.Client(**client.dict())
    db.add(db_client)
    db.commit()
    db.refresh(db_client)
    return db_client

@app.get("/clients/", response_model=List[schemas.ClientResponse])
def get_clients(db: Session = Depends(get_db)):
    return db.query(models.Client).all()

@app.get("/clients/{client_id}", response_model=schemas.ClientResponse)
def get_client(client_id: int, db: Session = Depends(get_db)):
    client = db.query(models.Client).filter(models.Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client

@app.delete("/clients/{client_id}")
def delete_client(client_id: int, db: Session = Depends(get_db)):
    client = db.query(models.Client).filter(models.Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    db.delete(client)
    db.commit()
    return {"message": "Client deleted"}


# ─── JOBS ───────────────────────────────────────────────────
@app.post("/jobs/", response_model=schemas.JobResponse)
def create_job(job: schemas.JobCreate, db: Session = Depends(get_db)):
    db_job = models.Job(**job.dict())
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job

@app.get("/jobs/", response_model=List[schemas.JobResponse])
def get_jobs(db: Session = Depends(get_db)):
    return db.query(models.Job).all()

@app.get("/jobs/{job_id}", response_model=schemas.JobResponse)
def get_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@app.delete("/jobs/{job_id}")
def delete_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    db.delete(job)
    db.commit()
    return {"message": "Job deleted"}


# ─── CANDIDATES ─────────────────────────────────────────────
@app.post("/candidates/", response_model=schemas.CandidateResponse)
def create_candidate(candidate: schemas.CandidateCreate, db: Session = Depends(get_db)):
    db_candidate = models.Candidate(**candidate.dict())
    db.add(db_candidate)
    db.commit()
    db.refresh(db_candidate)
    return db_candidate

@app.get("/candidates/", response_model=List[schemas.CandidateResponse])
def get_candidates(db: Session = Depends(get_db)):
    return db.query(models.Candidate).all()

@app.get("/candidates/{candidate_id}", response_model=schemas.CandidateResponse)
def get_candidate(candidate_id: int, db: Session = Depends(get_db)):
    candidate = db.query(models.Candidate).filter(models.Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return candidate

@app.put("/candidates/{candidate_id}", response_model=schemas.CandidateResponse)
def update_candidate(candidate_id: int, candidate: schemas.CandidateCreate, db: Session = Depends(get_db)):
    db_candidate = db.query(models.Candidate).filter(models.Candidate.id == candidate_id).first()
    if not db_candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    for key, value in candidate.dict().items():
        setattr(db_candidate, key, value)
    db.commit()
    db.refresh(db_candidate)
    return db_candidate

@app.delete("/candidates/{candidate_id}")
def delete_candidate(candidate_id: int, db: Session = Depends(get_db)):
    candidate = db.query(models.Candidate).filter(models.Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    db.delete(candidate)
    db.commit()
    return {"message": "Candidate deleted"}

@app.post("/candidates/{candidate_id}/upload-cv")
def upload_cv(candidate_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    candidate = db.query(models.Candidate).filter(models.Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    file_path = os.path.join(UPLOAD_DIR, f"{candidate_id}_{file.filename}")
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    candidate.cv_path = file_path
    db.commit()
    return {"message": "CV uploaded", "path": file_path}


# ─── PIPELINE ───────────────────────────────────────────────
@app.post("/pipeline/", response_model=schemas.PipelineResponse)
def create_pipeline(pipeline: schemas.PipelineCreate, db: Session = Depends(get_db)):
    db_pipeline = models.Pipeline(**pipeline.dict())
    db.add(db_pipeline)
    db.commit()
    db.refresh(db_pipeline)
    return db_pipeline

@app.get("/pipeline/", response_model=List[schemas.PipelineResponse])
def get_pipeline(db: Session = Depends(get_db)):
    return db.query(models.Pipeline).all()

@app.put("/pipeline/{pipeline_id}", response_model=schemas.PipelineResponse)
def update_pipeline_stage(pipeline_id: int, pipeline: schemas.PipelineCreate, db: Session = Depends(get_db)):
    db_pipeline = db.query(models.Pipeline).filter(models.Pipeline.id == pipeline_id).first()
    if not db_pipeline:
        raise HTTPException(status_code=404, detail="Pipeline entry not found")
    for key, value in pipeline.dict().items():
        setattr(db_pipeline, key, value)
    db.commit()
    db.refresh(db_pipeline)
    return db_pipeline

@app.delete("/pipeline/{pipeline_id}")
def delete_pipeline(pipeline_id: int, db: Session = Depends(get_db)):
    db_pipeline = db.query(models.Pipeline).filter(models.Pipeline.id == pipeline_id).first()
    if not db_pipeline:
        raise HTTPException(status_code=404, detail="Pipeline entry not found")
    db.delete(db_pipeline)
    db.commit()
    return {"message": "Pipeline entry deleted"}
import React, { useEffect, useState } from 'react';
import {
  Box, Paper, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Chip, IconButton,
  InputAdornment, Tooltip, LinearProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import EditIcon from '@mui/icons-material/Edit';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import axios from 'axios';

const API = 'https://sprintcast-ats-backend.onrender.com';

const EMPTY_FORM = {
  name: '', email: '', phone: '', location: '',
  experience_years: '', current_company: '', current_ctc: '',
  expected_ctc: '', notice_period: '', skills: '', linkedin_url: '', notes: '',
};

const NOTICE_COLORS = {
  'Immediate': '#10B981',
  '15 Days': '#F59E0B',
  '30 Days': '#F59E0B',
  '60 Days': '#EF4444',
  '90 Days': '#EF4444',
};

function ResumeUploadZone({ candidateId, currentPath, onUpload }) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file) => {
    if (!file || file.type !== 'application/pdf') {
      alert('Please upload a PDF file only.');
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      await axios.post(`${API}/candidates/${candidateId}/upload-cv`, formData);
      onUpload();
    } catch (err) {
      console.error(err);
    }
    setUploading(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const openPicker = () => {
    document.getElementById('pdf-upload-' + candidateId).click();
  };

  if (currentPath) {
    return (
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: 1,
        p: 1.5, borderRadius: 2,
        bgcolor: 'rgba(16, 185, 129, 0.1)',
        border: '1px solid #10B981',
      }}>
        <CheckCircleIcon sx={{ color: '#10B981', fontSize: 18 }} />
        <PictureAsPdfIcon sx={{ color: '#EF4444', fontSize: 18 }} />
        <Typography variant="caption" sx={{ color: '#10B981', fontWeight: 600 }}>
          Resume Uploaded
        </Typography>
        <Tooltip title="Replace Resume">
          <IconButton size="small" onClick={openPicker} sx={{ ml: 'auto' }}>
            <UploadFileIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <input
          id={'pdf-upload-' + candidateId}
          type="file"
          accept="application/pdf"
          style={{ display: 'none' }}
          onChange={(e) => handleFile(e.target.files[0])}
        />
      </Box>
    );
  }

  return (
    <Box
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={openPicker}
      sx={{
        border: '2px dashed',
        borderColor: dragging ? 'primary.main' : 'rgba(255,255,255,0.15)',
        borderRadius: 2,
        p: 2,
        textAlign: 'center',
        bgcolor: dragging ? 'rgba(0,200,255,0.05)' : 'transparent',
        transition: 'all 0.2s',
        cursor: 'pointer',
        '&:hover': { borderColor: 'primary.main', bgcolor: 'rgba(0,200,255,0.03)' }
      }}
    >
      <input
        id={'pdf-upload-' + candidateId}
        type="file"
        accept="application/pdf"
        style={{ display: 'none' }}
        onChange={(e) => handleFile(e.target.files[0])}
      />
      <PictureAsPdfIcon sx={{ color: 'text.secondary', fontSize: 28, mb: 1 }} />
      <Typography variant="caption" color="text.secondary" display="block">
        Drag & drop PDF or <span style={{ color: '#00C8FF' }}>browse</span>
      </Typography>
      {uploading && <LinearProgress sx={{ mt: 1, borderRadius: 1 }} />}
    </Box>
  );
}

export default function Candidates() {
  const [candidates, setCandidates] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [open, setOpen] = useState(false);
  const [resumeDialog, setResumeDialog] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState('');
  const [editId, setEditId] = useState(null);
const [pendingCV, setPendingCV] = useState(null);

  const fetchCandidates = async () => {
    const res = await axios.get(`${API}/candidates/`);
    setCandidates(res.data);
    setFiltered(res.data);
  };

  useEffect(() => { fetchCandidates(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(candidates.filter(c =>
      c.name?.toLowerCase().includes(q) ||
      c.skills?.toLowerCase().includes(q) ||
      c.current_company?.toLowerCase().includes(q) ||
      c.location?.toLowerCase().includes(q)
    ));
  }, [search, candidates]);

const handleSubmit = async () => {
    try {
      if (editId) {
        await axios.put(`${API}/candidates/${editId}`, form);
        if (pendingCV) {
          const formData = new FormData();
          formData.append('file', pendingCV);
          await axios.post(`${API}/candidates/${editId}/upload-cv`, formData);
        }
      } else {
        const res = await axios.post(`${API}/candidates/`, form);
        if (pendingCV) {
          const formData = new FormData();
          formData.append('file', pendingCV);
          await axios.post(`${API}/candidates/${res.data.id}/upload-cv`, formData);
        }
      }
      setOpen(false);
      setForm(EMPTY_FORM);
      setEditId(null);
      setPendingCV(null);
      fetchCandidates();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (candidate) => {
    setForm({ ...candidate });
    setEditId(candidate.id);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this candidate?')) {
      await axios.delete(`${API}/candidates/${id}`);
      fetchCandidates();
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Candidates</Typography>
          <Typography variant="body2" color="text.secondary">
            {candidates.length} total candidates in your database
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => { setForm(EMPTY_FORM); setEditId(null); setOpen(true); }}
          sx={{ px: 3 }}
        >
          Add Candidate
        </Button>
      </Box>

      {/* Search */}
      <TextField
        fullWidth
        placeholder="Search by name, skills, company, location..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>
        }}
      />

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {['Name', 'Current Company', 'Experience', 'Skills', 'Notice Period', 'Current CTC', 'Expected CTC', 'Resume', 'Actions'].map(h => (
                <TableCell key={h} sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                  No candidates yet. Add your first candidate to get started.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((c) => (
                <TableRow key={c.id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{c.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{c.email}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{c.current_company || '—'}</Typography>
                    <Typography variant="caption" color="text.secondary">{c.location}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{c.experience_years ? `${c.experience_years} yrs` : '—'}</Typography>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 200 }}>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {c.skills?.split(',').slice(0, 3).map((s, i) => (
                        <Chip key={i} label={s.trim()} size="small" sx={{ fontSize: '0.7rem' }} />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={c.notice_period || '—'}
                      size="small"
                      sx={{
                        bgcolor: NOTICE_COLORS[c.notice_period] || '#94A3B8',
                        color: '#fff', fontWeight: 600, fontSize: '0.7rem'
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{c.current_ctc || '—'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{c.expected_ctc || '—'}</Typography>
                  </TableCell>
                  <TableCell sx={{ minWidth: 160 }}>
                    <ResumeUploadZone
                      candidateId={c.id}
                      currentPath={c.cv_path}
                      onUpload={fetchCandidates}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleEdit(c)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" color="error" onClick={() => handleDelete(c.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editId ? 'Edit Candidate' : 'Add New Candidate'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 1 }}>
            {[
              { label: 'Full Name *', key: 'name' },
              { label: 'Email', key: 'email' },
              { label: 'Phone', key: 'phone' },
              { label: 'Location', key: 'location' },
              { label: 'Experience (Years)', key: 'experience_years' },
              { label: 'Current Company', key: 'current_company' },
              { label: 'Current CTC', key: 'current_ctc' },
              { label: 'Expected CTC', key: 'expected_ctc' },
              { label: 'Notice Period', key: 'notice_period' },
              { label: 'LinkedIn URL', key: 'linkedin_url' },
            ].map(function(field) {
              return (
                <TextField
                  key={field.key}
                  label={field.label}
                  value={form[field.key]}
                  onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                  size="small"
                  fullWidth
                />
              );
            })}
            <TextField
              label="Skills (comma separated)"
              value={form.skills}
              onChange={(e) => setForm({ ...form, skills: e.target.value })}
              size="small"
              fullWidth
              sx={{ gridColumn: 'span 2' }}
              placeholder="Java, Spring Boot, Angular, BFSI"
            />
            <TextField
              label="Notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              size="small"
              fullWidth
              multiline
              rows={3}
              sx={{ gridColumn: 'span 2' }}
            />
            <Box sx={{ gridColumn: 'span 2' }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                Resume (PDF) {!editId && <span style={{ color: '#94A3B8', fontWeight: 400 }}>— you can upload after saving</span>}
              </Typography>
              {editId ? (
                <ResumeUploadZone
                  candidateId={editId}
                  currentPath={form.cv_path}
                  onUpload={() => { fetchCandidates(); setOpen(false); }}
                />
              ) : (
                <Box
                  onClick={() => document.getElementById('new-candidate-cv').click()}
                  sx={{
                    border: '2px dashed',
                    borderColor: pendingCV ? '#10B981' : 'rgba(255,255,255,0.15)',
                    borderRadius: 2, p: 2, textAlign: 'center',
                    cursor: 'pointer', transition: 'all 0.2s',
                    bgcolor: pendingCV ? 'rgba(16,185,129,0.05)' : 'transparent',
                    '&:hover': { borderColor: 'primary.main', bgcolor: 'rgba(0,200,255,0.03)' }
                  }}
                >
                  <input
                    id="new-candidate-cv"
                    type="file"
                    accept="application/pdf"
                    style={{ display: 'none' }}
                    onChange={(e) => setPendingCV(e.target.files[0])}
                  />
                  {pendingCV ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                      <CheckCircleIcon sx={{ color: '#10B981', fontSize: 20 }} />
                      <Typography variant="caption" sx={{ color: '#10B981', fontWeight: 600 }}>
                        {pendingCV.name}
                      </Typography>
                    </Box>
                  ) : (
                    <>
                      <PictureAsPdfIcon sx={{ color: 'text.secondary', fontSize: 28, mb: 0.5 }} />
                      <Typography variant="caption" color="text.secondary" display="block">
                        Drag & drop PDF or <span style={{ color: '#00C8FF' }}>browse</span>
                      </Typography>
                    </>
                  )}
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {editId ? 'Update Candidate' : 'Add Candidate'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
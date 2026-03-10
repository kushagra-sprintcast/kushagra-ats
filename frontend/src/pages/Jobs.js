import React, { useEffect, useState } from 'react';
import {
  Box, Paper, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Chip, IconButton,
  MenuItem, Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import axios from 'axios';

const API = 'https://sprintcast-ats-backend.onrender.com';

const EMPTY_FORM = {
  title: '', company: '', location: '', budget_min: '',
  budget_max: '', experience_min: '', experience_max: '',
  skills: '', status: 'Active', notes: '', client_id: '',
};

const STATUS_COLORS = {
  Active: '#10B981',
  OnHold: '#F59E0B',
  Closed: '#EF4444',
};

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [clients, setClients] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);

  const fetchData = async () => {
    const [jobsRes, clientsRes] = await Promise.all([
      axios.get(`${API}/jobs/`),
      axios.get(`${API}/clients/`),
    ]);
    setJobs(jobsRes.data);
    setClients(clientsRes.data);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async () => {
    try {
      const payload = {
        ...form,
        budget_min: form.budget_min ? parseInt(form.budget_min) : null,
        budget_max: form.budget_max ? parseInt(form.budget_max) : null,
        experience_min: form.experience_min ? parseInt(form.experience_min) : null,
        experience_max: form.experience_max ? parseInt(form.experience_max) : null,
        client_id: form.client_id ? parseInt(form.client_id) : null,
      };
      if (editId) {
        await axios.put(`${API}/jobs/${editId}`, payload);
      } else {
        await axios.post(`${API}/jobs/`, payload);
      }
      setOpen(false);
      setForm(EMPTY_FORM);
      setEditId(null);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (job) => {
    setForm({ ...job });
    setEditId(job.id);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this job?')) {
      await axios.delete(`${API}/jobs/${id}`);
      fetchData();
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Jobs</Typography>
          <Typography variant="body2" color="text.secondary">
            {jobs.filter(j => j.status === 'Active').length} active mandates
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => { setForm(EMPTY_FORM); setEditId(null); setOpen(true); }}
          sx={{ px: 3 }}
        >
          Add Job
        </Button>
      </Box>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {['Job Title', 'Company', 'Location', 'Budget (LPA)', 'Experience', 'Skills', 'Status', 'Actions'].map(h => (
                <TableCell key={h} sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {jobs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                  No jobs yet. Add your first mandate to get started.
                </TableCell>
              </TableRow>
            ) : (
              jobs.map((j) => (
                <TableRow key={j.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{j.title}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{j.company}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{j.location || '—'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {j.budget_min && j.budget_max ? `₹${j.budget_min}–${j.budget_max} LPA` : '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {j.experience_min && j.experience_max ? `${j.experience_min}–${j.experience_max} yrs` : '—'}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 200 }}>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {j.skills?.split(',').slice(0, 3).map((s, i) => (
                        <Chip key={i} label={s.trim()} size="small" sx={{ fontSize: '0.7rem' }} />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={j.status}
                      size="small"
                      sx={{
                        bgcolor: STATUS_COLORS[j.status] || '#94A3B8',
                        color: '#fff',
                        fontWeight: 600,
                        fontSize: '0.7rem'
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleEdit(j)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" color="error" onClick={() => handleDelete(j.id)}>
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
          {editId ? 'Edit Job' : 'Add New Job'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 1 }}>
            {[
              { label: 'Job Title *', key: 'title' },
              { label: 'Company *', key: 'company' },
              { label: 'Location', key: 'location' },
              { label: 'Budget Min (LPA)', key: 'budget_min' },
              { label: 'Budget Max (LPA)', key: 'budget_max' },
              { label: 'Experience Min (Yrs)', key: 'experience_min' },
              { label: 'Experience Max (Yrs)', key: 'experience_max' },
            ].map(({ label, key }) => (
              <TextField
                key={key}
                label={label}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                size="small"
                fullWidth
              />
            ))}
            <TextField
              select
              label="Status"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              size="small"
              fullWidth
            >
              {['Active', 'OnHold', 'Closed'].map(s => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Client"
              value={form.client_id}
              onChange={(e) => setForm({ ...form, client_id: e.target.value })}
              size="small"
              fullWidth
            >
              <MenuItem value="">No Client</MenuItem>
              {clients.map(c => (
                <MenuItem key={c.id} value={c.id}>{c.name} — {c.company}</MenuItem>
              ))}
            </TextField>
            <TextField
              label="Skills (comma separated)"
              value={form.skills}
              onChange={(e) => setForm({ ...form, skills: e.target.value })}
              size="small"
              fullWidth
              sx={{ gridColumn: 'span 2' }}
              placeholder="Java 17, Spring Boot, Angular, BFSI"
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
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {editId ? 'Update Job' : 'Add Job'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
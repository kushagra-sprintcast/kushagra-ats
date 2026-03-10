import React, { useEffect, useState } from 'react';
import {
  Box, Paper, Typography, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Chip, IconButton,
  MenuItem, Tooltip, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, ToggleButton, ToggleButtonGroup
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import TableRowsIcon from '@mui/icons-material/TableRows';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import axios from 'axios';

const API = 'https://sprintcast-ats-backend.onrender.com';

const STAGES = ['Sourced', 'Screening', 'Submitted', 'Interview', 'Offer', 'Joined', 'Rejected'];

const STAGE_COLORS = {
  Sourced: '#00C8FF',
  Screening: '#7B61FF',
  Submitted: '#F59E0B',
  Interview: '#8B5CF6',
  Offer: '#10B981',
  Joined: '#059669',
  Rejected: '#EF4444',
};

const EMPTY_FORM = { candidate_id: '', job_id: '', stage: 'Sourced', notes: '' };

export default function Pipeline() {
  const [pipeline, setPipeline] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [view, setView] = useState('kanban');

  const fetchData = async () => {
    const [pRes, cRes, jRes] = await Promise.all([
      axios.get(`${API}/pipeline/`),
      axios.get(`${API}/candidates/`),
      axios.get(`${API}/jobs/`),
    ]);
    setPipeline(pRes.data);
    setCandidates(cRes.data);
    setJobs(jRes.data);
  };

  useEffect(() => { fetchData(); }, []);

  const getCandidateName = (id) => candidates.find(c => c.id === id)?.name || 'Unknown';
  const getJobTitle = (id) => jobs.find(j => j.id === id)?.title || 'Unknown';

  const handleSubmit = async () => {
    try {
      await axios.post(`${API}/pipeline/`, {
        ...form,
        candidate_id: parseInt(form.candidate_id),
        job_id: parseInt(form.job_id),
      });
      setOpen(false);
      setForm(EMPTY_FORM);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Remove from pipeline?')) {
      await axios.delete(`${API}/pipeline/${id}`);
      fetchData();
    }
  };

  const handleStageChange = async (id, newStage) => {
    const item = pipeline.find(p => p.id === id);
    await axios.put(`${API}/pipeline/${id}`, { ...item, stage: newStage });
    fetchData();
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    const newStage = destination.droppableId;
    await handleStageChange(parseInt(draggableId), newStage);
  };

  const getByStage = (stage) => pipeline.filter(p => p.stage === stage);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Pipeline</Typography>
          <Typography variant="body2" color="text.secondary">
            {pipeline.length} candidates across all stages
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <ToggleButtonGroup
            value={view}
            exclusive
            onChange={(e, val) => val && setView(val)}
            size="small"
          >
            <ToggleButton value="kanban"><ViewKanbanIcon fontSize="small" /></ToggleButton>
            <ToggleButton value="table"><TableRowsIcon fontSize="small" /></ToggleButton>
          </ToggleButtonGroup>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => { setForm(EMPTY_FORM); setOpen(true); }}
            sx={{ px: 3 }}
          >
            Add to Pipeline
          </Button>
        </Box>
      </Box>

      {/* Kanban View */}
      {view === 'kanban' && (
        <DragDropContext onDragEnd={onDragEnd}>
          <Box sx={{
            display: 'flex',
            gap: 2,
            overflowX: 'auto',
            pb: 2,
            '&::-webkit-scrollbar': { height: 6 },
            '&::-webkit-scrollbar-thumb': { borderRadius: 3, bgcolor: 'rgba(255,255,255,0.2)' },
          }}>
            {STAGES.map((stage) => (
              <Box key={stage} sx={{ minWidth: 220, flex: '0 0 220px' }}>
                {/* Stage Header */}
                <Box sx={{
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', mb: 1.5, px: 1
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{
                      width: 8, height: 8, borderRadius: '50%',
                      bgcolor: STAGE_COLORS[stage]
                    }} />
                    <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.8rem' }}>
                      {stage}
                    </Typography>
                  </Box>
                  <Chip
                    label={getByStage(stage).length}
                    size="small"
                    sx={{
                      height: 20, fontSize: '0.7rem',
                      bgcolor: STAGE_COLORS[stage],
                      color: '#fff', fontWeight: 700
                    }}
                  />
                </Box>

                {/* Droppable Column */}
                <Droppable droppableId={stage}>
                  {(provided, snapshot) => (
                    <Box
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      sx={{
                        minHeight: 400,
                        bgcolor: snapshot.isDraggingOver
                          ? `${STAGE_COLORS[stage]}15`
                          : 'rgba(255,255,255,0.02)',
                        borderRadius: 2,
                        border: '1px dashed',
                        borderColor: snapshot.isDraggingOver
                          ? STAGE_COLORS[stage]
                          : 'rgba(255,255,255,0.08)',
                        p: 1,
                        transition: 'all 0.2s',
                      }}
                    >
                      {getByStage(stage).map((item, index) => (
                        <Draggable
                          key={item.id}
                          draggableId={String(item.id)}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <Paper
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              sx={{
                                p: 1.5, mb: 1,
                                borderLeft: `3px solid ${STAGE_COLORS[stage]}`,
                                cursor: 'grab',
                                transform: snapshot.isDragging ? 'rotate(2deg)' : 'none',
                                transition: 'transform 0.1s',
                                '&:hover': { borderColor: STAGE_COLORS[stage] },
                              }}
                            >
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.8rem', mb: 0.3 }}>
                                    {getCandidateName(item.candidate_id)}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                    {getJobTitle(item.job_id)}
                                  </Typography>
                                  {item.notes && (
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, fontSize: '0.68rem', fontStyle: 'italic' }}>
                                      {item.notes}
                                    </Typography>
                                  )}
                                </Box>
                                <Tooltip title="Remove">
                                  <IconButton size="small" onClick={() => handleDelete(item.id)} sx={{ ml: 0.5, opacity: 0.5, '&:hover': { opacity: 1, color: 'error.main' } }}>
                                    <DeleteIcon sx={{ fontSize: 14 }} />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </Paper>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </Box>
                  )}
                </Droppable>
              </Box>
            ))}
          </Box>
        </DragDropContext>
      )}

      {/* Table View */}
      {view === 'table' && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                {['Candidate', 'Job', 'Stage', 'Notes', 'Added On', 'Actions'].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {pipeline.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    No candidates in pipeline yet.
                  </TableCell>
                </TableRow>
              ) : (
                pipeline.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {getCandidateName(item.candidate_id)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{getJobTitle(item.job_id)}</Typography>
                    </TableCell>
                    <TableCell>
                      <TextField
                        select
                        size="small"
                        value={item.stage}
                        onChange={(e) => handleStageChange(item.id, e.target.value)}
                        sx={{ minWidth: 130 }}
                      >
                        {STAGES.map(s => (
                          <MenuItem key={s} value={s}>{s}</MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {item.notes || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(item.created_at).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Delete">
                        <IconButton size="small" color="error" onClick={() => handleDelete(item.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add to Pipeline Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Add Candidate to Pipeline</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 1 }}>
            <TextField
              select
              label="Candidate *"
              value={form.candidate_id}
              onChange={(e) => setForm({ ...form, candidate_id: e.target.value })}
              size="small"
              fullWidth
            >
              {candidates.map(c => (
                <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Job *"
              value={form.job_id}
              onChange={(e) => setForm({ ...form, job_id: e.target.value })}
              size="small"
              fullWidth
            >
              {jobs.map(j => (
                <MenuItem key={j.id} value={j.id}>{j.title} — {j.company}</MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Stage"
              value={form.stage}
              onChange={(e) => setForm({ ...form, stage: e.target.value })}
              size="small"
              fullWidth
            >
              {STAGES.map(s => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </TextField>
            <TextField
              label="Notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              size="small"
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>Add to Pipeline</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
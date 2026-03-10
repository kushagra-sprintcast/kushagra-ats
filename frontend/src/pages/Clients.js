import React, { useEffect, useState } from 'react';
import {
  Box, Paper, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, IconButton, Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import axios from 'axios';

const API = 'https://sprintcast-ats-backend.onrender.com';

const EMPTY_FORM = {
  name: '', company: '', email: '', phone: '', notes: '',
};

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);

  const fetchClients = async () => {
    const res = await axios.get(`${API}/clients/`);
    setClients(res.data);
  };

  useEffect(() => { fetchClients(); }, []);

  const handleSubmit = async () => {
    try {
      if (editId) {
        await axios.put(`${API}/clients/${editId}`, form);
      } else {
        await axios.post(`${API}/clients/`, form);
      }
      setOpen(false);
      setForm(EMPTY_FORM);
      setEditId(null);
      fetchClients();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (client) => {
    setForm({ ...client });
    setEditId(client.id);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this client?')) {
      await axios.delete(`${API}/clients/${id}`);
      fetchClients();
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Clients</Typography>
          <Typography variant="body2" color="text.secondary">
            {clients.length} clients in your network
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => { setForm(EMPTY_FORM); setEditId(null); setOpen(true); }}
          sx={{ px: 3 }}
        >
          Add Client
        </Button>
      </Box>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {['Name', 'Company', 'Email', 'Phone', 'Notes', 'Actions'].map(h => (
                <TableCell key={h} sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                  No clients yet. Add your first client to get started.
                </TableCell>
              </TableRow>
            ) : (
              clients.map((c) => (
                <TableRow key={c.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{c.name}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{c.company}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{c.email || '—'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{c.phone || '—'}</Typography>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 200 }}>
                    <Typography variant="body2" noWrap color="text.secondary">
                      {c.notes || '—'}
                    </Typography>
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
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editId ? 'Edit Client' : 'Add New Client'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 1 }}>
            {[
              { label: 'Contact Name *', key: 'name' },
              { label: 'Company *', key: 'company' },
              { label: 'Email', key: 'email' },
              { label: 'Phone', key: 'phone' },
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
            {editId ? 'Update Client' : 'Add Client'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
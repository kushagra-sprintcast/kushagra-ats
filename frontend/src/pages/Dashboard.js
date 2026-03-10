import React, { useEffect, useState } from 'react';
import { Box, Grid, Paper, Typography, Chip } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import WorkIcon from '@mui/icons-material/Work';
import BusinessIcon from '@mui/icons-material/Business';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import axios from 'axios';

const API = 'https://sprintcast-ats-backend.onrender.com';

const STAGE_COLORS = {
  Sourced: '#00C8FF',
  Screening: '#7B61FF',
  Submitted: '#F59E0B',
  Interview: '#8B5CF6',
  Offer: '#10B981',
  Joined: '#059669',
  Rejected: '#EF4444',
};

function StatCard({ icon, label, value, color }) {
  return (
    <Paper sx={{ p: 3, height: '100%', position: 'relative', overflow: 'hidden' }}>
      <Box sx={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', bgcolor: color, opacity: 0.08 }} />
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: color, color: '#fff', display: 'flex', alignItems: 'center' }}>
          {icon}
        </Box>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: color }}>{value}</Typography>
          <Typography variant="body2" color="text.secondary">{label}</Typography>
        </Box>
      </Box>
    </Paper>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState({ candidates: 0, jobs: 0, clients: 0, pipeline: [] });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [candidates, jobs, clients, pipeline] = await Promise.all([
          axios.get(API + '/candidates/'),
          axios.get(API + '/jobs/'),
          axios.get(API + '/clients/'),
          axios.get(API + '/pipeline/'),
        ]);
        setStats({
          candidates: candidates.data.length,
          jobs: jobs.data.length,
          clients: clients.data.length,
          pipeline: pipeline.data,
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  const stageCounts = stats.pipeline.reduce((acc, item) => {
    acc[item.stage] = (acc[item.stage] || 0) + 1;
    return acc;
  }, {});

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>Dashboard</Typography>
        <Typography variant="body2" color="text.secondary">Welcome back, Kushagra. Here is your recruitment overview.</Typography>
      </Box>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard icon={<PeopleIcon />} label="Total Candidates" value={stats.candidates} color="#00C8FF" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard icon={<WorkIcon />} label="Active Jobs" value={stats.jobs} color="#7B61FF" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard icon={<BusinessIcon />} label="Clients" value={stats.clients} color="#F59E0B" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard icon={<TrendingUpIcon />} label="In Pipeline" value={stats.pipeline.length} color="#10B981" />
        </Grid>
      </Grid>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>Pipeline Breakdown</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {Object.entries(STAGE_COLORS).map(function(entry) {
            var stage = entry[0];
            var color = entry[1];
            return (
              <Box key={stage} sx={{ flex: 1, minWidth: 100, p: 2, borderRadius: 2, border: '1px solid', borderColor: color, textAlign: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: color }}>
                  {stageCounts[stage] || 0}
                </Typography>
                <Chip label={stage} size="small" sx={{ mt: 1, bgcolor: color, color: '#fff', fontWeight: 600, fontSize: '0.7rem' }} />
              </Box>
            );
          })}
        </Box>
      </Paper>
    </Box>
  );
}

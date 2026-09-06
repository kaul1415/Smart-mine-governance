import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import PageHeader from '../../components/common/PageHeader.jsx';
import LoadingState from '../../components/common/LoadingState.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import Button from '../../components/common/Button.jsx';
import { mineService } from '../../services/mineService.js';
import { riskService } from '../../services/riskService.js';

const RISK_COLORS = { LOW: '#2F6846', MEDIUM: '#B7791F', HIGH: '#B3401D', CRITICAL: '#8C1D1D' };

function riskIcon(level) {
  const color = RISK_COLORS[level] || RISK_COLORS.MEDIUM;
  return L.divIcon({
    className: '',
    html: `<div style="width:18px;height:18px;border-radius:9999px;background:${color};border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.4)"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

export default function RiskMap() {
  const navigate = useNavigate();
  const [state, setState] = useState({ status: 'loading', mines: [], error: null });

  async function load() {
    setState({ status: 'loading', mines: [], error: null });
    try {
      const [mines, riskScores] = await Promise.all([mineService.getMines(), riskService.getRiskScores()]);
      const merged = mines.map((m) => ({ ...m, risk: riskScores.find((r) => r.mineId === m.id) || null }));
      setState({ status: 'success', mines: merged, error: null });
    } catch (err) {
      setState({ status: 'error', mines: [], error: err.message || 'Unable to load the risk map.' });
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (state.status === 'loading') {
    return (
      <>
        <PageHeader title="Risk Map" description="GIS view of mine sites by risk level." />
        <LoadingState label="Loading risk map…" />
      </>
    );
  }

  if (state.status === 'error') {
    return (
      <>
        <PageHeader title="Risk Map" description="GIS view of mine sites by risk level." />
        <ErrorState message={state.error} onRetry={load} />
      </>
    );
  }

  return (
    <>
      <PageHeader title="Risk Map" description="Mine sites plotted by location, colored by current risk level. Coordinates are illustrative for this prototype." />

      <div className="mb-4 flex flex-wrap items-center gap-4 text-xs text-ink-700">
        {Object.entries(RISK_COLORS).map(([level, color]) => (
          <span key={level} className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full border border-white shadow" style={{ background: color }} />
            {level}
          </span>
        ))}
      </div>

      <div className="overflow-hidden rounded-md border border-border shadow-card">
        <MapContainer center={[21.8, 83.5]} zoom={5} style={{ height: '520px', width: '100%' }} scrollWheelZoom={false}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {state.mines.map((mine) => (
            <Marker key={mine.id} position={mine.coordinates} icon={riskIcon(mine.risk?.level || mine.riskLevel)}>
              <Popup>
                <div className="min-w-[180px] space-y-1 text-sm">
                  <p className="font-semibold text-ink-900">{mine.name}</p>
                  <p className="text-xs text-ink-500">{mine.location}</p>
                  <p>
                    Risk: <span className="font-medium">{mine.riskLevel}</span> ({mine.riskScore}/100)
                  </p>
                  <p>Open Flags: {mine.openFlags}</p>
                  <p>Overdue Actions: {mine.openCorrectiveActions}</p>
                  <p>Compliance: {mine.complianceRate}%</p>
                  <Button size="sm" className="mt-1 w-full" onClick={() => navigate(`/mines/${mine.id}`)}>
                    View Mine
                  </Button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </>
  );
}

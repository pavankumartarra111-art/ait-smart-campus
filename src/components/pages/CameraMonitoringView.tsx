import React, { useState } from 'react';
import { 
  Camera, 
  Plus, 
  Filter, 
  Video, 
  Cpu, 
  Layers, 
  X, 
  Check, 
  AlertCircle, 
  Activity,
  Shield,
  Eye
} from 'lucide-react';
import { CameraLocation, CameraMode } from '../../types/campus';
import { campusStore } from '../../services/campusStore';
import { CameraFeedCard } from '../cameras/CameraFeedCard';
import { LaptopWebcamStationModal } from '../common/LaptopWebcamStationModal';

export const CameraMonitoringView: React.FC = () => {
  const [cameras, setCameras] = useState<CameraLocation[]>(campusStore.getCameras());
  const [filterMode, setFilterMode] = useState<'ALL' | CameraMode>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showWebcamStationModal, setShowWebcamStationModal] = useState(false);
  const [editingCamera, setEditingCamera] = useState<CameraLocation | null>(null);

  // Form states for adding/editing camera
  const [formData, setFormData] = useState({
    name: '',
    zone: 'Academic Block',
    cameraCode: `AIT-CAM-${Math.floor(10 + Math.random() * 90)}`,
    status: 'ACTIVE' as 'ACTIVE' | 'WARNING' | 'OFFLINE',
    mode: 'simulated' as CameraMode,
    currentOccupancy: 35,
    maxCapacity: 100,
    density: 'MODERATE' as 'LOW' | 'MODERATE' | 'HIGH' | 'VERY HIGH',
    notes: ''
  });

  // Re-sync on store changes
  React.useEffect(() => {
    return campusStore.subscribe(() => {
      setCameras(campusStore.getCameras());
    });
  }, []);

  const filteredCameras = cameras.filter(cam => {
    const matchesMode = filterMode === 'ALL' || cam.mode === filterMode;
    const matchesSearch = cam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          cam.cameraCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          cam.zone.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesMode && matchesSearch;
  });

  const handleOpenAdd = () => {
    setEditingCamera(null);
    setFormData({
      name: '',
      zone: 'Academic Block',
      cameraCode: `AIT-CAM-LOC${Math.floor(10 + Math.random() * 90)}`,
      status: 'ACTIVE',
      mode: 'simulated',
      currentOccupancy: 25,
      maxCapacity: 120,
      density: 'LOW',
      notes: 'New AIT campus camera location node.'
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (cam: CameraLocation) => {
    setEditingCamera(cam);
    setFormData({
      name: cam.name,
      zone: cam.zone,
      cameraCode: cam.cameraCode,
      status: cam.status,
      mode: cam.mode,
      currentOccupancy: cam.currentOccupancy,
      maxCapacity: cam.maxCapacity,
      density: cam.density,
      notes: cam.notes || ''
    });
    setShowAddModal(true);
  };

  const handleSaveCamera = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingCamera) {
      campusStore.updateCamera(editingCamera.id, formData);
    } else {
      campusStore.addCamera({
        ...formData,
        lastUpdated: 'Just now',
        hasMotion: true,
        pedestrianCountIn: 0,
        pedestrianCountOut: 0
      });
    }
    setShowAddModal(false);
  };

  const handleDeleteCamera = (id: string) => {
    if (confirm('Are you sure you want to remove this camera location configuration?')) {
      campusStore.deleteCamera(id);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Page Title & Operational Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-ait bg-amber-500/20 text-amber-300 border border-amber-500/30">
              SURVEILLANCE DIGITAL TWIN
            </span>
            <span className="text-xs font-mono text-slate-400">
              AIT PUNE CAMPUS CAMERA NETWORK
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 font-serif">
            Campus Camera Monitoring Grid
          </h1>
          <p className="text-xs text-slate-400">
            Multi-mode video surveillance: Live Laptop Webcam, Uploaded Video Stream, and Synthetic Simulated Feeds.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowWebcamStationModal(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-950/40 border border-emerald-400/30 transition-all shrink-0"
          >
            <Camera className="w-4 h-4" />
            <span>Connect Laptop Live Webcam</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping" />
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-lg shadow-amber-950/30 transition-all shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Camera Location</span>
          </button>
        </div>
      </div>

      {/* Filter and Mode Ribbon */}
      <div className="glass-panel p-3.5 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        
        {/* Mode Selector Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'ALL', label: 'All Feeds', count: cameras.length },
            { id: 'simulated' as CameraMode, label: 'Simulated Feeds', count: cameras.filter(c => c.mode === 'simulated').length, icon: Cpu },
            { id: 'webcam' as CameraMode, label: 'Laptop Webcam', count: cameras.filter(c => c.mode === 'webcam').length, icon: Eye },
            { id: 'sample_video' as CameraMode, label: 'Sample Video', count: cameras.filter(c => c.mode === 'sample_video').length, icon: Video },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterMode(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-1.5 transition-all ${
                filterMode === tab.id
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {tab.icon && <tab.icon className="w-3.5 h-3.5" />}
              <span>{tab.label}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-950 text-slate-400">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter location or camera code..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
          />
        </div>

      </div>

      {/* Camera Grid (3 columns on desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCameras.map(cam => (
          <CameraFeedCard
            key={cam.id}
            camera={cam}
            onEdit={handleOpenEdit}
            onDelete={handleDeleteCamera}
          />
        ))}

        {filteredCameras.length === 0 && (
          <div className="col-span-full py-16 text-center text-slate-500 flex flex-col items-center">
            <Camera className="w-10 h-10 text-slate-600 mb-2" />
            <p className="text-sm font-semibold">No cameras match the selected filter</p>
            <p className="text-xs text-slate-500">Try changing your search term or mode filter.</p>
          </div>
        )}
      </div>

      {/* Add / Edit Camera Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d1522] border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Camera className="w-4 h-4 text-amber-400" />
                <span>{editingCamera ? 'Edit Camera Configuration' : 'Add New Campus Camera Location'}</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCamera} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Location Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Alandi Road Gate 2 / Robotics Center"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Campus Zone</label>
                  <select
                    value={formData.zone}
                    onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500/50"
                  >
                    <option value="Perimeter Security">Perimeter Security</option>
                    <option value="Central Spine">Central Spine</option>
                    <option value="Academic Block A">Academic Block A</option>
                    <option value="Academic Block B">Academic Block B</option>
                    <option value="Academic Support">Academic Support (Library)</option>
                    <option value="Amenities">Amenities (Mess/Canteen)</option>
                    <option value="Commercial Hub">Commercial Hub</option>
                    <option value="Cultural Block">Cultural Block (Auditorium)</option>
                    <option value="Transport Hub">Transport Hub (Parking)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Camera Code</label>
                  <input
                    type="text"
                    required
                    value={formData.cameraCode}
                    onChange={(e) => setFormData({ ...formData, cameraCode: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Mode</label>
                  <select
                    value={formData.mode}
                    onChange={(e) => setFormData({ ...formData, mode: e.target.value as CameraMode })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500/50"
                  >
                    <option value="simulated">Simulated Feed</option>
                    <option value="webcam">Laptop Webcam</option>
                    <option value="sample_video">Sample Video</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Est. Occupancy</label>
                  <input
                    type="number"
                    value={formData.currentOccupancy}
                    onChange={(e) => setFormData({ ...formData, currentOccupancy: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Max Capacity</label>
                  <input
                    type="number"
                    value={formData.maxCapacity}
                    onChange={(e) => setFormData({ ...formData, maxCapacity: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Operational Notes</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Zone coverage specifics..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-950/30"
                >
                  {editingCamera ? 'Save Changes' : 'Create Camera Node'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Laptop Webcam Station Modal */}
      <LaptopWebcamStationModal
        isOpen={showWebcamStationModal}
        onClose={() => setShowWebcamStationModal(false)}
      />

    </div>
  );
};

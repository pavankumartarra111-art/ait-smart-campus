import React, { useState, useEffect, useRef } from 'react';
import { 
  PackageSearch, 
  Search, 
  Plus, 
  Filter, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  ShieldAlert, 
  Video, 
  Camera, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Eye, 
  EyeOff, 
  FileText, 
  Sparkles, 
  Calendar, 
  ChevronRight, 
  Lock, 
  Unlock, 
  Play, 
  Pause, 
  RotateCcw, 
  Tag, 
  HelpCircle, 
  Send, 
  Bookmark, 
  SlidersHorizontal,
  ExternalLink,
  Layers,
  ArrowRight,
  UserCheck,
  Building,
  Laptop,
  Check,
  Info
} from 'lucide-react';
import { campusStore } from '../../services/campusStore';
import { 
  User, 
  LostItemReport, 
  FoundItemReport, 
  CctvSearchRequest, 
  ItemClaim, 
  LostFoundMatch, 
  LostAndFoundCategory, 
  CctvRequestStatus, 
  ClaimStatus,
  CameraLocation
} from '../../types/campus';

const CATEGORIES: LostAndFoundCategory[] = [
  'Earbuds and AirPods',
  'Mobile phones',
  'Water bottles',
  'Wallets and purses',
  'Bags and backpacks',
  'Keys',
  'Student ID cards',
  'Books and notebooks',
  'Chargers and electronic accessories',
  'Watches and jewellery',
  'Clothing',
  'Other items'
];

const CAMPUS_ZONES = [
  'Academic Block A / Central Library',
  'Academic Block A',
  'Academic Block B',
  'Central Spine',
  'Amenities / Dining Complex',
  'Sports Complex',
  'Workshop Complex',
  'Cariappa Hall (Boys)',
  'Kalpana Chawla Bhavan (Girls)',
  'Main Gate / Perimeter'
];

interface LostAndFoundViewProps {
  currentUser?: User;
}

export const LostAndFoundView: React.FC<LostAndFoundViewProps> = ({ currentUser: propUser }) => {
  const [currentUser, setCurrentUser] = useState<User>(propUser || campusStore.getCurrentUser());
  const [activeTab, setActiveTab] = useState<'lost' | 'found' | 'matches' | 'cctv' | 'approval' | 'my-records'>('lost');

  // Datasets from campusStore
  const [lostItems, setLostItems] = useState<LostItemReport[]>(campusStore.getLostItems());
  const [foundItems, setFoundItems] = useState<FoundItemReport[]>(campusStore.getFoundItems());
  const [cctvRequests, setCctvRequests] = useState<CctvSearchRequest[]>(campusStore.getCctvRequests());
  const [itemClaims, setItemClaims] = useState<ItemClaim[]>(campusStore.getItemClaims());
  const [potentialMatches, setPotentialMatches] = useState<LostFoundMatch[]>(campusStore.findAllPotentialMatches());
  const [cameras] = useState<CameraLocation[]>(campusStore.getCameras());

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedZone, setSelectedZone] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  // Modals
  const [isReportLostModalOpen, setIsReportLostModalOpen] = useState(false);
  const [isReportFoundModalOpen, setIsReportFoundModalOpen] = useState(false);
  const [isCctvRequestModalOpen, setIsCctvRequestModalOpen] = useState(false);
  const [isCctvApprovalModalOpen, setIsCctvApprovalModalOpen] = useState(false);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [isFootageViewerOpen, setIsFootageViewerOpen] = useState(false);
  const [selectedLostItem, setSelectedLostItem] = useState<LostItemReport | null>(null);
  const [selectedFoundItem, setSelectedFoundItem] = useState<FoundItemReport | null>(null);
  const [selectedCctvRequest, setSelectedCctvRequest] = useState<CctvSearchRequest | null>(null);
  const [selectedClaim, setSelectedClaim] = useState<ItemClaim | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<LostFoundMatch | null>(null);

  // Form States - Report Lost Item
  const [lostForm, setLostForm] = useState({
    itemName: '',
    category: 'Earbuds and AirPods' as LostAndFoundCategory,
    brand: '',
    color: '',
    description: '',
    distinctiveFeatures: '',
    lastKnownLocation: '',
    campusZone: 'Academic Block A / Central Library',
    dateLost: new Date().toISOString().slice(0, 10),
    approximateTime: '14:00',
    photoUrl: '',
    additionalInfo: ''
  });

  // Form States - Report Found Item
  const [foundForm, setFoundForm] = useState({
    itemName: '',
    category: 'Earbuds and AirPods' as LostAndFoundCategory,
    brand: '',
    color: '',
    description: '',
    locationFound: '',
    campusZone: 'Academic Block A / Central Library',
    dateFound: new Date().toISOString().slice(0, 10),
    approximateTime: '14:30',
    photoUrl: '',
    holdingLocation: 'Campus Main Gate Security Command Post',
    collectionInstructions: 'Present student ID or prove unique item traits to officer on duty.'
  });

  // Form States - CCTV Request
  const [cctvForm, setCctvForm] = useState({
    preferredCameraId: 'cam-03',
    incidentDate: new Date().toISOString().slice(0, 10),
    requestedStartTime: '12:00',
    requestedEndTime: '14:00',
    purpose: '',
    monitoredAreaDetail: '',
    additionalInfo: ''
  });

  // Form States - Claim Item
  const [claimForm, setClaimForm] = useState({
    proofOfOwnership: '',
    proofPhotoUrl: '',
    contactNote: ''
  });

  // Form States - CCTV Approval Decision
  const [approvalDecision, setApprovalDecision] = useState<{
    approvedStart: string;
    approvedEnd: string;
    decisionReason: string;
  }>({
    approvedStart: '12:00',
    approvedEnd: '14:00',
    decisionReason: 'Legitimate personal property recovery request approved under campus surveillance policy.'
  });

  // CCTV Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentTimeOffset, setCurrentTimeOffset] = useState(0); // seconds
  const [maskBystanders, setMaskBystanders] = useState(true);
  const [sightingNote, setSightingNote] = useState('');
  const [sightingConfidence, setSightingConfidence] = useState<'HIGH' | 'MODERATE' | 'TENTATIVE'>('HIGH');
  const [finalResultChoice, setFinalResultChoice] = useState<'Item Located' | 'Possible Sighting' | 'No Useful Sighting' | 'Request Further Assistance'>('Possible Sighting');
  const [finalResultNote, setFinalResultNote] = useState('');

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Subscribe to campusStore
  useEffect(() => {
    return campusStore.subscribe(() => {
      setLostItems(campusStore.getLostItems());
      setFoundItems(campusStore.getFoundItems());
      setCctvRequests(campusStore.getCctvRequests());
      setItemClaims(campusStore.getItemClaims());
      setPotentialMatches(campusStore.findAllPotentialMatches());
      setCurrentUser(campusStore.getCurrentUser());
    });
  }, []);

  // Sync propUser if changed
  useEffect(() => {
    if (propUser) setCurrentUser(propUser);
  }, [propUser]);

  // Handle Role Switching for Testing Experience
  const isSecurityOrAdmin = currentUser.role === 'super_admin' || 
                            currentUser.role === 'campus_admin' || 
                            currentUser.role === 'security_operator' || 
                            currentUser.role === 'security_staff';

  const handleRoleToggle = (targetRole: 'student' | 'security_staff' | 'campus_admin') => {
    campusStore.switchRole(targetRole);
    setCurrentUser(campusStore.getCurrentUser());
    showToast(`Switched active view session to [${targetRole}]`);
  };

  // --------------------------------------------------------------------------
  // ACTIONS & HANDLERS
  // --------------------------------------------------------------------------

  // 1. Submit Lost Item
  const handleSubmitLostItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lostForm.itemName.trim() || !lostForm.description.trim()) {
      alert('Please provide item name and description.');
      return;
    }

    const created = campusStore.addLostItem({
      userId: currentUser.id,
      reporterName: currentUser.name,
      reporterRole: currentUser.role,
      reporterContact: currentUser.email,
      itemName: lostForm.itemName.trim(),
      category: lostForm.category,
      brand: lostForm.brand.trim() || 'Unspecified',
      color: lostForm.color.trim() || 'Unspecified',
      description: lostForm.description.trim(),
      distinctiveFeatures: lostForm.distinctiveFeatures.trim() || 'None recorded',
      lastKnownLocation: lostForm.lastKnownLocation.trim() || lostForm.campusZone,
      campusZone: lostForm.campusZone,
      dateLost: lostForm.dateLost,
      approximateTime: lostForm.approximateTime,
      photoUrl: lostForm.photoUrl.trim() || undefined,
      additionalInfo: lostForm.additionalInfo.trim() || undefined
    });

    setIsReportLostModalOpen(false);
    showToast(`Lost item registered [${created.id}]. Generated matching report.`);

    // If matches found, auto-prompt user
    const matches = campusStore.findMatchesForLostItem(created);
    if (matches.length > 0) {
      setActiveTab('matches');
    }
  };

  // 2. Submit Found Item
  const handleSubmitFoundItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!foundForm.itemName.trim() || !foundForm.description.trim() || !foundForm.locationFound.trim()) {
      alert('Please fill in item name, description, and location found.');
      return;
    }

    const created = campusStore.addFoundItem({
      finderId: currentUser.id,
      finderName: currentUser.name,
      finderRole: currentUser.role,
      itemName: foundForm.itemName.trim(),
      category: foundForm.category,
      brand: foundForm.brand.trim() || undefined,
      color: foundForm.color.trim() || undefined,
      description: foundForm.description.trim(),
      locationFound: foundForm.locationFound.trim(),
      campusZone: foundForm.campusZone,
      dateFound: foundForm.dateFound,
      approximateTime: foundForm.approximateTime,
      photoUrl: foundForm.photoUrl.trim() || undefined,
      holdingLocation: foundForm.holdingLocation.trim(),
      collectionInstructions: foundForm.collectionInstructions.trim()
    });

    setIsReportFoundModalOpen(false);
    showToast(`Found item recorded [${created.id}]. Custody logged.`);
  };

  // 3. Initiate CCTV Request from a Lost Item
  const handleOpenCctvRequest = (lost: LostItemReport) => {
    setSelectedLostItem(lost);
    // Auto suggest camera by zone
    const suggestedCam = cameras.find(c => c.zone.toLowerCase().includes(lost.campusZone.toLowerCase()) || c.name.toLowerCase().includes(lost.lastKnownLocation.toLowerCase())) || cameras[2] || cameras[0];
    
    setCctvForm({
      preferredCameraId: suggestedCam.id,
      incidentDate: lost.dateLost,
      requestedStartTime: lost.approximateTime ? `${lost.approximateTime.split(':')[0]}:00` : '12:00',
      requestedEndTime: lost.approximateTime ? `${String(Math.min(23, Number(lost.approximateTime.split(':')[0]) + 2)).padStart(2, '0')}:00` : '14:00',
      purpose: `Locate missing ${lost.itemName} (${lost.category}) reported lost at ${lost.lastKnownLocation}.`,
      monitoredAreaDetail: `Area near ${lost.lastKnownLocation}`,
      additionalInfo: `Lost report reference: ${lost.id}`
    });
    setIsCctvRequestModalOpen(true);
  };

  const handleSubmitCctvRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLostItem) return;
    if (!cctvForm.purpose.trim()) {
      alert('Please provide a legitimate purpose for surveillance footage review.');
      return;
    }

    const targetCamera = cameras.find(c => c.id === cctvForm.preferredCameraId) || cameras[0];

    const req = campusStore.addCctvRequest({
      lostReportId: selectedLostItem.id,
      requesterId: currentUser.id,
      requesterName: currentUser.name,
      requesterRole: currentUser.role,
      itemName: selectedLostItem.itemName,
      category: selectedLostItem.category,
      itemDescription: selectedLostItem.description,
      lastKnownLocation: selectedLostItem.lastKnownLocation,
      preferredCameraId: targetCamera.id,
      preferredCameraName: targetCamera.name,
      preferredCameraCode: targetCamera.cameraCode,
      incidentDate: cctvForm.incidentDate,
      requestedStartTime: cctvForm.requestedStartTime,
      requestedEndTime: cctvForm.requestedEndTime,
      purpose: cctvForm.purpose.trim(),
      monitoredAreaDetail: cctvForm.monitoredAreaDetail.trim() || undefined,
      additionalInfo: cctvForm.additionalInfo.trim() || undefined,
      sampleVideoUrl: targetCamera.sampleVideoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
    });

    setIsCctvRequestModalOpen(false);
    showToast(`CCTV Search Request submitted [${req.id}]. Awaiting Security Review.`);
    setActiveTab('cctv');
  };

  // 4. CCTV Approval / Rejection by Security
  const handleOpenApprovalModal = (req: CctvSearchRequest) => {
    setSelectedCctvRequest(req);
    setApprovalDecision({
      approvedStart: req.requestedStartTime,
      approvedEnd: req.requestedEndTime,
      decisionReason: 'Legitimate personal property recovery request approved under campus surveillance policy.'
    });
    setIsCctvApprovalModalOpen(true);
  };

  const handleApproveRequest = () => {
    if (!selectedCctvRequest) return;
    campusStore.approveCctvRequest(
      selectedCctvRequest.id,
      currentUser.name,
      approvalDecision.decisionReason,
      approvalDecision.approvedStart,
      approvalDecision.approvedEnd
    );
    setIsCctvApprovalModalOpen(false);
    showToast(`Approved CCTV Request [${selectedCctvRequest.id}]. Authorized footage released.`);
  };

  const handleRejectRequest = () => {
    if (!selectedCctvRequest) return;
    const reason = prompt('Please state the administrative reason for rejection:', 'Requested timeframe is outside authorized camera retention / camera blind spot.');
    if (!reason) return;
    campusStore.rejectCctvRequest(selectedCctvRequest.id, currentUser.name, reason);
    setIsCctvApprovalModalOpen(false);
    showToast(`CCTV Request [${selectedCctvRequest.id}] marked as Rejected.`);
  };

  // 5. Open Secure Footage Review Station
  const handleOpenFootageViewer = (req: CctvSearchRequest) => {
    if (req.status !== 'Approved' && req.status !== 'Footage Available' && req.status !== 'Search in Progress' && !isSecurityOrAdmin) {
      alert('Access Restricted: Footage access is only granted upon Security Officer authorization.');
      return;
    }
    setSelectedCctvRequest(req);
    setCurrentTimeOffset(0);
    setIsPlaying(false);
    setIsFootageViewerOpen(true);
  };

  // 6. Record CCTV Sighting Bookmark
  const handleAddSighting = () => {
    if (!selectedCctvRequest || !sightingNote.trim()) {
      alert('Please enter a description of the observed movement or sighting.');
      return;
    }

    const minutes = Math.floor(currentTimeOffset / 60);
    const seconds = currentTimeOffset % 60;
    const formattedTs = `${selectedCctvRequest.approvedStartTime || selectedCctvRequest.requestedStartTime}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    campusStore.addCctvSighting(selectedCctvRequest.id, {
      timestampOffsetSeconds: currentTimeOffset,
      formattedTimestamp: formattedTs,
      cameraLocation: selectedCctvRequest.preferredCameraName,
      notes: sightingNote.trim(),
      confidence: sightingConfidence,
      recordedBy: currentUser.name,
      snapshotUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&auto=format&fit=crop&q=80'
    });

    setSightingNote('');
    showToast(`Sighting bookmark logged at ${formattedTs}`);
    // Refresh selected request state
    const updated = campusStore.getCctvRequestById(selectedCctvRequest.id);
    if (updated) setSelectedCctvRequest(updated);
  };

  // 7. Finalize CCTV Search Outcome
  const handleFinalizeSearch = () => {
    if (!selectedCctvRequest) return;
    campusStore.finalizeCctvSearch(selectedCctvRequest.id, finalResultChoice, finalResultNote);
    showToast(`CCTV search outcome [${finalResultChoice}] recorded.`);
    const updated = campusStore.getCctvRequestById(selectedCctvRequest.id);
    if (updated) setSelectedCctvRequest(updated);
  };

  // 8. Open Claim Item Modal
  const handleOpenClaimModal = (found: FoundItemReport, lostId?: string) => {
    setSelectedFoundItem(found);
    setClaimForm({
      proofOfOwnership: '',
      proofPhotoUrl: '',
      contactNote: `Claimed by ${currentUser.name} (${currentUser.role})`
    });
    setIsClaimModalOpen(true);
  };

  const handleSubmitClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFoundItem || !claimForm.proofOfOwnership.trim()) {
      alert('Please provide distinguishing proof of ownership.');
      return;
    }

    const claim = campusStore.addClaim({
      foundItemId: selectedFoundItem.id,
      foundItemName: selectedFoundItem.itemName,
      lostReportId: selectedLostItem ? selectedLostItem.id : undefined,
      claimantId: currentUser.id,
      claimantName: currentUser.name,
      claimantEmail: currentUser.email,
      proofOfOwnership: claimForm.proofOfOwnership.trim(),
      proofPhotoUrl: claimForm.proofPhotoUrl.trim() || undefined,
      handoverLocation: selectedFoundItem.holdingLocation
    });

    setIsClaimModalOpen(false);
    showToast(`Claim [${claim.id}] submitted. Awaiting verification by security staff.`);
    setActiveTab('my-records');
  };

  // --------------------------------------------------------------------------
  // FILTERING LOGIC
  // --------------------------------------------------------------------------
  const filterList = <T extends { category?: string; campusZone?: string; itemName?: string; description?: string }>(items: T[]) => {
    return items.filter(item => {
      const matchesSearch = !searchQuery.trim() || 
        (item.itemName || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
        (item.description || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = selectedCategory === 'ALL' || item.category === selectedCategory;
      const matchesZone = selectedZone === 'ALL' || item.campusZone === selectedZone;
      return matchesSearch && matchesCat && matchesZone;
    });
  };

  const filteredLostItems = filterList(lostItems);
  const filteredFoundItems = filterList(foundItems);

  // Statistics
  const openLostCount = lostItems.filter(l => l.status !== 'RECOVERED' && l.status !== 'CLOSED').length;
  const inCustodyCount = foundItems.filter(f => f.status !== 'RETURNED_TO_OWNER').length;
  const matchesCount = potentialMatches.length;
  const activeCctvCount = cctvRequests.filter(r => r.status === 'Submitted' || r.status === 'Under Review' || r.status === 'Footage Available' || r.status === 'Search in Progress').length;
  const recoveredCount = lostItems.filter(l => l.status === 'RECOVERED').length + foundItems.filter(f => f.status === 'RETURNED_TO_OWNER').length;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-lg bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 text-xs shadow-2xl backdrop-blur-md animate-fade-in font-mono">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Header Banner */}
      <div className="card-ait p-5 sm:p-6 border-amber-500/30 bg-gradient-to-r from-slate-900 via-[#0d1627] to-cyan-950/30 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <PackageSearch className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-bold font-serif text-slate-100 tracking-wide">
                Intelligent Lost & Found System
              </h1>
              <span className="badge-ait bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono">
                CCTV-ASSISTED AI RECOVERY
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Campus-wide belongings recovery portal integrating automated community report matching and authorized, privacy-compliant CCTV surveillance footage search.
            </p>
          </div>

          {/* Quick Action Buttons & Role Tester */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsReportLostModalOpen(true)}
              className="btn-ait-primary py-2 px-3.5 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-amber-950/40"
            >
              <Plus className="w-4 h-4" />
              Report Lost Item
            </button>

            <button
              onClick={() => setIsReportFoundModalOpen(true)}
              className="py-2 px-3.5 rounded-lg bg-cyan-600/90 hover:bg-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-lg shadow-cyan-950/40"
            >
              <Check className="w-4 h-4" />
              Report Found Item
            </button>

            {/* Role Perspective Switcher for Testing */}
            <div className="flex items-center gap-1 text-[11px] font-mono p-1 rounded-lg bg-slate-950/80 border border-slate-800">
              <span className="text-slate-500 px-1.5">Role:</span>
              <button
                onClick={() => handleRoleToggle('student')}
                className={`px-2 py-0.5 rounded transition-colors ${currentUser.role === 'student' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
                title="View as Student / Requester"
              >
                Student
              </button>
              <button
                onClick={() => handleRoleToggle('security_staff')}
                className={`px-2 py-0.5 rounded transition-colors ${currentUser.role === 'security_staff' || currentUser.role === 'security_operator' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
                title="View as Security Personnel"
              >
                Security
              </button>
              <button
                onClick={() => handleRoleToggle('campus_admin')}
                className={`px-2 py-0.5 rounded transition-colors ${currentUser.role === 'campus_admin' || currentUser.role === 'super_admin' ? 'bg-purple-500 text-white font-bold' : 'text-slate-400 hover:text-slate-200'}`}
                title="View as Campus Administrator"
              >
                Admin
              </button>
            </div>
          </div>
        </div>

        {/* Live KPI Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-5 pt-4 border-t border-slate-800/80 text-xs">
          <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
            <div className="text-[10px] text-slate-400 font-mono">Active Lost Reports</div>
            <div className="text-lg font-bold font-mono text-amber-300">{openLostCount}</div>
            <div className="text-[10px] text-slate-500">Unrecovered items</div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
            <div className="text-[10px] text-slate-400 font-mono">Found in Custody</div>
            <div className="text-lg font-bold font-mono text-cyan-300">{inCustodyCount}</div>
            <div className="text-[10px] text-slate-500">At security desks</div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950/60 border border-amber-500/20 bg-amber-500/5">
            <div className="text-[10px] text-amber-400 font-mono flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Intelligent Matches
            </div>
            <div className="text-lg font-bold font-mono text-amber-300">{matchesCount}</div>
            <div className="text-[10px] text-amber-500">AI Compatibility &gt; 45%</div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
            <div className="text-[10px] text-slate-400 font-mono">CCTV Search Requests</div>
            <div className="text-lg font-bold font-mono text-purple-300">{activeCctvCount}</div>
            <div className="text-[10px] text-slate-500">Surveillance investigations</div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950/60 border border-emerald-500/20 bg-emerald-500/5 col-span-2 sm:col-span-1">
            <div className="text-[10px] text-emerald-400 font-mono">Total Recovered</div>
            <div className="text-lg font-bold font-mono text-emerald-300">{recoveredCount}</div>
            <div className="text-[10px] text-emerald-500">Returned to owners</div>
          </div>
        </div>
      </div>

      {/* Main Tabbed Navigation Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 overflow-x-auto">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('lost')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'lost'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            LOST ITEMS
            <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] text-slate-300 font-mono">
              {lostItems.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('found')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'found'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            FOUND ITEMS
            <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] text-slate-300 font-mono">
              {foundItems.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('matches')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'matches'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-950/30'
                : 'text-amber-300 hover:bg-amber-500/10'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            INTELLIGENT MATCHES
            {matchesCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${activeTab === 'matches' ? 'bg-slate-950 text-amber-300' : 'bg-amber-500/20 text-amber-300'}`}>
                {matchesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('cctv')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'cctv'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            CCTV SEARCHES
            <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] text-slate-300 font-mono">
              {cctvRequests.length}
            </span>
          </button>

          {isSecurityOrAdmin && (
            <button
              onClick={() => setActiveTab('approval')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'approval'
                  ? 'bg-red-500/20 text-red-300 border border-red-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
              SECURITY APPROVAL DESK
            </button>
          )}

          <button
            onClick={() => setActiveTab('my-records')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'my-records'
                ? 'bg-slate-800 text-slate-200 border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            MY REPORTS &amp; CLAIMS
          </button>
        </div>
      </div>

      {/* Global Filter Bar for Listings */}
      {(activeTab === 'lost' || activeTab === 'found') && (
        <div className="card-ait p-3 bg-slate-900/50 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-1 min-w-[240px] items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search by item name, brand, color, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-ait text-xs pl-9 py-1.5 w-full"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="select-ait text-xs py-1.5"
            >
              <option value="ALL">All Categories</option>
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="select-ait text-xs py-1.5"
            >
              <option value="ALL">All Campus Zones</option>
              {CAMPUS_ZONES.map(z => (
                <option key={z} value={z}>{z}</option>
              ))}
            </select>

            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('ALL'); setSelectedZone('ALL'); }}
              className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 1: LOST ITEMS SECTION                                             */}
      {/* ===================================================================== */}
      {activeTab === 'lost' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-200 uppercase font-mono tracking-wider flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-400" />
              Reported Lost Items ({filteredLostItems.length})
            </h2>
            <span className="text-xs text-slate-400">
              Select <strong>FIND MY ITEM</strong> to search matches or request CCTV footage review
            </span>
          </div>

          {filteredLostItems.length === 0 ? (
            <div className="card-ait p-12 text-center space-y-3">
              <PackageSearch className="w-12 h-12 text-slate-600 mx-auto" />
              <div className="text-sm font-semibold text-slate-300">No matching lost reports found</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No items have been reported missing under this filter. If you have lost a belonging, register a new report below.
              </p>
              <button
                onClick={() => setIsReportLostModalOpen(true)}
                className="btn-ait-primary py-1.5 px-4 text-xs font-bold inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Report Lost Belonging
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLostItems.map(item => {
                const matches = campusStore.findMatchesForLostItem(item);
                const hasMatch = matches.length > 0;
                const hasCctv = !!item.cctvRequestId;

                return (
                  <div 
                    key={item.id}
                    className="card-ait p-4 flex flex-col justify-between space-y-3 hover:border-amber-500/40 transition-all bg-[#0a111c]/90 group"
                  >
                    <div>
                      {/* Top Meta Header */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <span className="text-[10px] font-mono text-amber-400/90 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                            {item.id}
                          </span>
                          <h3 className="text-sm font-bold text-slate-100 group-hover:text-amber-300 transition-colors mt-1 line-clamp-1">
                            {item.itemName}
                          </h3>
                        </div>

                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold shrink-0 ${
                          item.status === 'RECOVERED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                          item.status === 'POTENTIAL_MATCH_FOUND' ? 'bg-amber-500 text-slate-950 font-bold animate-pulse' :
                          item.status === 'CCTV_SEARCHING' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                          'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}>
                          {item.status.replace(/_/g, ' ')}
                        </span>
                      </div>

                      {/* Photo / Category Thumbnail */}
                      <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-950 border border-slate-800 mb-3 flex items-center justify-center">
                        {item.photoUrl ? (
                          <img 
                            src={item.photoUrl} 
                            alt={item.itemName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="text-center p-4 text-slate-600">
                            <Tag className="w-8 h-8 mx-auto mb-1 opacity-50" />
                            <span className="text-[11px] font-mono">{item.category}</span>
                          </div>
                        )}

                        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[10px] font-mono text-slate-300">
                          {item.category}
                        </div>
                      </div>

                      {/* Item Attributes */}
                      <p className="text-xs text-slate-300 line-clamp-2 mb-2 leading-relaxed">
                        {item.description}
                      </p>

                      <div className="space-y-1 text-[11px] text-slate-400 font-mono">
                        <div className="flex items-center gap-1.5 truncate">
                          <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span className="truncate">{item.lastKnownLocation}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>{item.dateLost} approx {item.approximateTime}</span>
                        </div>
                        {item.distinctiveFeatures && (
                          <div className="text-[10px] text-slate-500 truncate pt-1 border-t border-slate-800/80">
                            Traits: {item.distinctiveFeatures}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="pt-3 border-t border-slate-800/80 space-y-2">
                      {hasMatch && (
                        <div 
                          onClick={() => { setSelectedMatch(matches[0]); setActiveTab('matches'); }}
                          className="p-2 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-300 cursor-pointer hover:bg-amber-500/20 transition-colors"
                        >
                          <span className="flex items-center gap-1 font-bold">
                            <Sparkles className="w-3.5 h-3.5" />
                            {matches.length} Potential Match Found! ({matches[0].score}% match)
                          </span>
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        {/* Primary Recovery Button: FIND MY ITEM */}
                        <button
                          onClick={() => {
                            setSelectedLostItem(item);
                            if (hasMatch) {
                              setActiveTab('matches');
                            } else {
                              handleOpenCctvRequest(item);
                            }
                          }}
                          className="flex-1 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded transition-colors flex items-center justify-center gap-1"
                        >
                          <Search className="w-3 h-3" />
                          FIND MY ITEM
                        </button>

                        {/* Prominent Action: REQUEST CCTV SEARCH */}
                        <button
                          onClick={() => handleOpenCctvRequest(item)}
                          className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/30 font-medium text-xs rounded transition-colors flex items-center gap-1"
                          title="Request authorized surveillance footage investigation"
                        >
                          <Video className="w-3 h-3" />
                          CCTV Search
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: FOUND ITEMS SECTION                                            */}
      {/* ===================================================================== */}
      {activeTab === 'found' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-200 uppercase font-mono tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              Items Found &amp; Turned in ({filteredFoundItems.length})
            </h2>
            <span className="text-xs text-slate-400">
              Belongs to you? Initiate ownership claim for secure verification &amp; handover
            </span>
          </div>

          {filteredFoundItems.length === 0 ? (
            <div className="card-ait p-12 text-center space-y-3">
              <PackageSearch className="w-12 h-12 text-slate-600 mx-auto" />
              <div className="text-sm font-semibold text-slate-300">No found items in this view</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No found items have been turned in matching this criteria. If you have recovered an item on campus, report it below.
              </p>
              <button
                onClick={() => setIsReportFoundModalOpen(true)}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-lg text-xs inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Report Found Item
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFoundItems.map(item => (
                <div 
                  key={item.id}
                  className="card-ait p-4 flex flex-col justify-between space-y-3 hover:border-cyan-500/40 transition-all bg-[#0a111c]/90 group"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <span className="text-[10px] font-mono text-cyan-400/90 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
                          {item.id}
                        </span>
                        <h3 className="text-sm font-bold text-slate-100 group-hover:text-cyan-300 transition-colors mt-1 line-clamp-1">
                          {item.itemName}
                        </h3>
                      </div>

                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold shrink-0 ${
                        item.status === 'RETURNED_TO_OWNER' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                        item.status === 'CLAIM_VERIFIED' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
                        item.status === 'CLAIM_PENDING' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        {item.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    {/* Thumbnail */}
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-950 border border-slate-800 mb-3 flex items-center justify-center">
                      {item.photoUrl ? (
                        <img 
                          src={item.photoUrl} 
                          alt={item.itemName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="text-center p-4 text-slate-600">
                          <CheckCircle2 className="w-8 h-8 mx-auto mb-1 opacity-50" />
                          <span className="text-[11px] font-mono">{item.category}</span>
                        </div>
                      )}

                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[10px] font-mono text-cyan-300">
                        {item.category}
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-2 mb-2 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="space-y-1 text-[11px] text-slate-400 font-mono">
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="truncate">Found at: {item.locationFound}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>Found on: {item.dateFound} ({item.approximateTime})</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-400/90 pt-1 border-t border-slate-800/80">
                        <Building className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">Held at: {item.holdingLocation}</span>
                      </div>
                    </div>
                  </div>

                  {/* Claim Action */}
                  <div className="pt-3 border-t border-slate-800/80">
                    <button
                      onClick={() => handleOpenClaimModal(item)}
                      disabled={item.status === 'RETURNED_TO_OWNER'}
                      className="w-full py-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-slate-950 font-bold text-xs rounded transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-cyan-950/20"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      {item.status === 'RETURNED_TO_OWNER' ? 'Returned to Owner' : 'Claim This Item'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: INTELLIGENT MATCHING ENGINE RESULTS                            */}
      {/* ===================================================================== */}
      {activeTab === 'matches' && (
        <div className="space-y-4">
          <div className="card-ait p-4 bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border-amber-500/30">
            <div className="flex items-start gap-3">
              <span className="p-2 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Sparkles className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  Automated Bi-Directional Match Engine
                  <span className="badge-ait bg-amber-500/20 text-amber-300 text-[10px]">Active</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  The matching engine cross-references categories, brand signatures, color descriptors, keyword tokens, campus zones, and chronological proximity. Suggested matches require ownership verification before item handover.
                </p>
              </div>
            </div>
          </div>

          {potentialMatches.length === 0 ? (
            <div className="card-ait p-12 text-center space-y-3">
              <Sparkles className="w-12 h-12 text-slate-600 mx-auto" />
              <div className="text-sm font-semibold text-slate-300">No high-confidence matches at present</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                As new found-item reports are submitted or updated, compatible matches will appear here automatically with confidence explanations.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {potentialMatches.map((m, idx) => (
                <div 
                  key={`${m.lostItem.id}-${m.foundItem.id}`}
                  className="card-ait p-4 sm:p-5 bg-slate-900/60 border-amber-500/30 space-y-4"
                >
                  {/* Match Header */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
                      <span className="text-xs font-mono font-bold text-amber-300">
                        MATCH CANDIDATE #{idx + 1}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        ({m.lostItem.id} ↔ {m.foundItem.id})
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-xs font-mono">
                        <span className="text-slate-400">Compatibility Score:</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-bold">
                          {m.score}% MATCH
                        </span>
                      </div>

                      <button
                        onClick={() => handleOpenClaimModal(m.foundItem, m.lostItem.id)}
                        className="btn-ait-primary py-1 px-3 text-xs font-bold flex items-center gap-1"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        Initiate Claim
                      </button>
                    </div>
                  </div>

                  {/* Supporting Factors Pill List */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-mono text-slate-400">Match Evidence:</span>
                    {m.supportingFactors.map((f, fi) => (
                      <span 
                        key={fi}
                        className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-mono flex items-center gap-1"
                      >
                        <Check className="w-3 h-3 text-amber-400" />
                        {f}
                      </span>
                    ))}
                  </div>

                  {/* Side-by-Side Comparison Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    {/* Left: Lost Item Report */}
                    <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-800/80">
                        <span className="font-mono text-amber-400 font-bold flex items-center gap-1">
                          <HelpCircle className="w-3.5 h-3.5" />
                          LOST REPORT • {m.lostItem.id}
                        </span>
                        <span className="text-slate-400 text-[11px]">{m.lostItem.dateLost}</span>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        {m.lostItem.photoUrl && (
                          <img 
                            src={m.lostItem.photoUrl} 
                            alt={m.lostItem.itemName}
                            className="w-16 h-16 rounded object-cover border border-slate-700 shrink-0"
                          />
                        )}
                        <div>
                          <h4 className="text-xs font-bold text-slate-100">{m.lostItem.itemName}</h4>
                          <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-2">{m.lostItem.description}</p>
                          <div className="text-[10px] text-slate-400 font-mono mt-1">
                            Brand: {m.lostItem.brand} | Color: {m.lostItem.color}
                          </div>
                          <div className="text-[10px] text-amber-300 font-mono flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" />
                            {m.lostItem.lastKnownLocation}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Found Item Report */}
                    <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-800/80">
                        <span className="font-mono text-cyan-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          FOUND REPORT • {m.foundItem.id}
                        </span>
                        <span className="text-slate-400 text-[11px]">{m.foundItem.dateFound}</span>
                      </div>

                      <div className="flex items-start gap-3">
                        {m.foundItem.photoUrl && (
                          <img 
                            src={m.foundItem.photoUrl} 
                            alt={m.foundItem.itemName}
                            className="w-16 h-16 rounded object-cover border border-slate-700 shrink-0"
                          />
                        )}
                        <div>
                          <h4 className="text-xs font-bold text-slate-100">{m.foundItem.itemName}</h4>
                          <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-2">{m.foundItem.description}</p>
                          <div className="text-[10px] text-slate-400 font-mono mt-1">
                            Brand: {m.foundItem.brand || 'N/A'} | Color: {m.foundItem.color || 'N/A'}
                          </div>
                          <div className="text-[10px] text-cyan-300 font-mono flex items-center gap-1 mt-0.5">
                            <Building className="w-3 h-3" />
                            Held at: {m.foundItem.holdingLocation}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 4: CCTV SEARCH REQUESTS TRACKING                                  */}
      {/* ===================================================================== */}
      {activeTab === 'cctv' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-200 uppercase font-mono tracking-wider flex items-center gap-2">
              <Video className="w-4 h-4 text-purple-400" />
              Surveillance Camera Search Requests ({cctvRequests.length})
            </h2>
            <span className="text-xs text-slate-400">
              Authorized searches through recorded camera archives
            </span>
          </div>

          <div className="space-y-3">
            {cctvRequests.map(req => {
              const hasAccess = req.status === 'Approved' || req.status === 'Footage Available' || req.status === 'Search in Progress' || isSecurityOrAdmin;

              return (
                <div 
                  key={req.id}
                  className="card-ait p-4 bg-[#0a111c] border-purple-500/30 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                          {req.id}
                        </span>
                        <span className="text-xs font-mono text-slate-400">
                          Ref: {req.lostReportId}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                          req.status === 'Footage Available' || req.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                          req.status === 'Under Review' || req.status === 'Submitted' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                          req.status === 'Rejected' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                          'bg-slate-800 text-slate-300'
                        }`}>
                          {req.status}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-100 mt-1">
                        {req.itemName} • <span className="text-slate-400 font-normal">{req.preferredCameraName}</span>
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      {hasAccess && (
                        <button
                          onClick={() => handleOpenFootageViewer(req)}
                          className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-md shadow-purple-950/30"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          Launch Footage Review Station
                        </button>
                      )}

                      {isSecurityOrAdmin && req.status === 'Under Review' && (
                        <button
                          onClick={() => handleOpenApprovalModal(req)}
                          className="px-3 py-1.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-lg transition-colors"
                        >
                          Review &amp; Authorize
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Request Detail Line */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-[11px] font-mono text-slate-400 bg-slate-950 p-2.5 rounded border border-slate-800">
                    <div>
                      <span className="text-slate-500 block">Requested Camera:</span>
                      <span className="text-slate-200">{req.preferredCameraCode}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Incident Date &amp; Window:</span>
                      <span className="text-slate-200">{req.incidentDate} ({req.requestedStartTime} - {req.requestedEndTime})</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Requester:</span>
                      <span className="text-slate-200">{req.requesterName}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Sightings Recorded:</span>
                      <span className="text-amber-300 font-bold">{req.sightings.length} Bookmarks</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 italic">
                    Purpose: "{req.purpose}"
                  </p>

                  {req.reviewDecisionReason && (
                    <div className="text-[11px] font-mono p-2 rounded bg-slate-900 border border-slate-800 text-slate-300">
                      <span className="text-purple-300 font-bold">Security Officer Memo:</span> {req.reviewDecisionReason} (Reviewed by {req.reviewedBy})
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 5: SECURITY APPROVAL DESK                                         */}
      {/* ===================================================================== */}
      {activeTab === 'approval' && isSecurityOrAdmin && (
        <div className="space-y-4">
          <div className="card-ait p-4 bg-gradient-to-r from-red-950/40 via-slate-900 to-slate-900 border-red-500/30">
            <div className="flex items-start gap-3">
              <span className="p-2 rounded-lg bg-red-500/20 text-red-300 border border-red-500/30">
                <ShieldAlert className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  Campus Security Surveillance Authorization Console
                  <span className="badge-ait bg-red-500/20 text-red-300 text-[10px]">Restricted</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Surveillance footage access is never granted automatically. Authorized security officers must verify legitimate recovery necessity, bound time windows to &lt; 4 hours, and enforce bystander privacy masking.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {cctvRequests.map(req => (
              <div 
                key={req.id}
                className="card-ait p-4 bg-slate-900/60 border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                      {req.id}
                    </span>
                    <span className="text-xs font-bold text-slate-200">{req.itemName}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                      req.status === 'Approved' || req.status === 'Footage Available' ? 'bg-emerald-500/20 text-emerald-300' :
                      req.status === 'Rejected' ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">
                    Requester: <strong className="text-slate-200">{req.requesterName}</strong> | Camera: <strong className="text-amber-300">{req.preferredCameraCode}</strong> ({req.preferredCameraName})
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Date: {req.incidentDate} | Window: {req.requestedStartTime} - {req.requestedEndTime}
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Justification: "{req.purpose}"
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleOpenApprovalModal(req)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded transition-colors"
                  >
                    Authorize Access
                  </button>
                  <button
                    onClick={() => { setSelectedCctvRequest(req); handleRejectRequest(); }}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 6: MY REPORTS & CLAIMS TRACKING                                   */}
      {/* ===================================================================== */}
      {activeTab === 'my-records' && (
        <div className="space-y-6">
          {/* User's Lost Reports */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-400" />
              My Lost Item Reports
            </h3>
            {lostItems.filter(l => l.userId === currentUser.id).length === 0 ? (
              <div className="card-ait p-6 text-center text-xs text-slate-500">
                You have not filed any lost item reports under this profile.
              </div>
            ) : (
              lostItems.filter(l => l.userId === currentUser.id).map(item => (
                <div key={item.id} className="card-ait p-3.5 flex items-center justify-between text-xs bg-slate-950/60">
                  <div>
                    <span className="font-mono text-amber-400 font-bold mr-2">{item.id}</span>
                    <strong className="text-slate-200">{item.itemName}</strong>
                    <div className="text-[11px] text-slate-500 font-mono">
                      Lost on {item.dateLost} at {item.lastKnownLocation}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                      {item.status}
                    </span>
                    <button
                      onClick={() => handleOpenCctvRequest(item)}
                      className="px-2.5 py-1 bg-purple-600/80 hover:bg-purple-600 text-white text-[11px] font-bold rounded"
                    >
                      Request CCTV
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* User's Submitted Claims */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-cyan-400" />
              Ownership Claims Filed
            </h3>
            {itemClaims.length === 0 ? (
              <div className="card-ait p-6 text-center text-xs text-slate-500">
                No active ownership claims filed.
              </div>
            ) : (
              itemClaims.map(clm => (
                <div key={clm.id} className="card-ait p-3.5 space-y-2 text-xs bg-slate-950/60">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono text-cyan-400 font-bold mr-2">{clm.id}</span>
                      <strong className="text-slate-200">{clm.foundItemName}</strong>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      clm.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-300' :
                      clm.status === 'APPROVED_READY_FOR_PICKUP' ? 'bg-cyan-500/20 text-cyan-300' :
                      'bg-amber-500/20 text-amber-300'
                    }`}>
                      {clm.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">Proof Provided: "{clm.proofOfOwnership}"</p>
                  {clm.handoverLocation && (
                    <div className="text-[11px] font-mono text-emerald-400">
                      Handover Location: {clm.handoverLocation}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 1: REPORT LOST ITEM FORM                                        */}
      {/* ===================================================================== */}
      {isReportLostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="card-ait w-full max-w-xl bg-[#0c1322] border-amber-500/30 p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-amber-400" />
                Report Lost Belonging
              </h3>
              <button 
                onClick={() => setIsReportLostModalOpen(false)}
                className="text-slate-400 hover:text-slate-100 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitLostItem} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Item Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AirPods Pro Gen 2"
                    value={lostForm.itemName}
                    onChange={(e) => setLostForm({ ...lostForm, itemName: e.target.value })}
                    className="input-ait w-full py-1.5"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Category *</label>
                  <select
                    value={lostForm.category}
                    onChange={(e) => setLostForm({ ...lostForm, category: e.target.value as any })}
                    className="select-ait w-full py-1.5"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Brand</label>
                  <input
                    type="text"
                    placeholder="e.g. Apple, Wildcraft, Milton"
                    value={lostForm.brand}
                    onChange={(e) => setLostForm({ ...lostForm, brand: e.target.value })}
                    className="input-ait w-full py-1.5"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Color</label>
                  <input
                    type="text"
                    placeholder="e.g. White with Sky Blue case"
                    value={lostForm.color}
                    onChange={(e) => setLostForm({ ...lostForm, color: e.target.value })}
                    className="input-ait w-full py-1.5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Item Description &amp; Distinctive Characteristics *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Describe scratches, stickers, unique markings, model variations..."
                  value={lostForm.description}
                  onChange={(e) => setLostForm({ ...lostForm, description: e.target.value })}
                  className="input-ait w-full py-1.5"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Distinctive Identifying Traits</label>
                <input
                  type="text"
                  placeholder="e.g. Initial 'P' carved on carabiner clip, Bluetooth name 'Pooja AirPods'"
                  value={lostForm.distinctiveFeatures}
                  onChange={(e) => setLostForm({ ...lostForm, distinctiveFeatures: e.target.value })}
                  className="input-ait w-full py-1.5"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Campus Zone</label>
                  <select
                    value={lostForm.campusZone}
                    onChange={(e) => setLostForm({ ...lostForm, campusZone: e.target.value })}
                    className="select-ait w-full py-1.5"
                  >
                    {CAMPUS_ZONES.map(z => (
                      <option key={z} value={z}>{z}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Specific Location Last Seen</label>
                  <input
                    type="text"
                    placeholder="e.g. Library 2nd floor desk 14"
                    value={lostForm.lastKnownLocation}
                    onChange={(e) => setLostForm({ ...lostForm, lastKnownLocation: e.target.value })}
                    className="input-ait w-full py-1.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Date Lost</label>
                  <input
                    type="date"
                    value={lostForm.dateLost}
                    onChange={(e) => setLostForm({ ...lostForm, dateLost: e.target.value })}
                    className="input-ait w-full py-1.5"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Approximate Time</label>
                  <input
                    type="time"
                    value={lostForm.approximateTime}
                    onChange={(e) => setLostForm({ ...lostForm, approximateTime: e.target.value })}
                    className="input-ait w-full py-1.5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Optional Photo URL</label>
                <input
                  type="text"
                  placeholder="https://... (or leave empty)"
                  value={lostForm.photoUrl}
                  onChange={(e) => setLostForm({ ...lostForm, photoUrl: e.target.value })}
                  className="input-ait w-full py-1.5"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsReportLostModalOpen(false)}
                  className="px-4 py-2 rounded text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-ait-primary py-2 px-5 font-bold flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Submit Report &amp; Search Matches
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 2: REPORT FOUND ITEM FORM                                       */}
      {/* ===================================================================== */}
      {isReportFoundModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="card-ait w-full max-w-xl bg-[#0c1322] border-cyan-500/30 p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                Report Found Item
              </h3>
              <button 
                onClick={() => setIsReportFoundModalOpen(false)}
                className="text-slate-400 hover:text-slate-100 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitFoundItem} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Item Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Stainless Steel Water Bottle"
                    value={foundForm.itemName}
                    onChange={(e) => setFoundForm({ ...foundForm, itemName: e.target.value })}
                    className="input-ait w-full py-1.5"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Category *</label>
                  <select
                    value={foundForm.category}
                    onChange={(e) => setFoundForm({ ...foundForm, category: e.target.value as any })}
                    className="select-ait w-full py-1.5"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Brand</label>
                  <input
                    type="text"
                    placeholder="e.g. Milton"
                    value={foundForm.brand}
                    onChange={(e) => setFoundForm({ ...foundForm, brand: e.target.value })}
                    className="input-ait w-full py-1.5"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Color</label>
                  <input
                    type="text"
                    placeholder="e.g. Matte Black"
                    value={foundForm.color}
                    onChange={(e) => setFoundForm({ ...foundForm, color: e.target.value })}
                    className="input-ait w-full py-1.5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Description (Public Description) *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Describe appearance. Avoid posting sensitive private details (e.g. exact keys or serial numbers) to prevent fraudulent claims."
                  value={foundForm.description}
                  onChange={(e) => setFoundForm({ ...foundForm, description: e.target.value })}
                  className="input-ait w-full py-1.5"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Location Found *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dining Hall table 8"
                    value={foundForm.locationFound}
                    onChange={(e) => setFoundForm({ ...foundForm, locationFound: e.target.value })}
                    className="input-ait w-full py-1.5"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Campus Zone</label>
                  <select
                    value={foundForm.campusZone}
                    onChange={(e) => setFoundForm({ ...foundForm, campusZone: e.target.value })}
                    className="select-ait w-full py-1.5"
                  >
                    {CAMPUS_ZONES.map(z => (
                      <option key={z} value={z}>{z}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Current Custody / Holding Location *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Main Gate Security Desk"
                    value={foundForm.holdingLocation}
                    onChange={(e) => setFoundForm({ ...foundForm, holdingLocation: e.target.value })}
                    className="input-ait w-full py-1.5"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Collection Instructions</label>
                  <input
                    type="text"
                    placeholder="e.g. Verify ID card with Havaldar on duty"
                    value={foundForm.collectionInstructions}
                    onChange={(e) => setFoundForm({ ...foundForm, collectionInstructions: e.target.value })}
                    className="input-ait w-full py-1.5"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsReportFoundModalOpen(false)}
                  className="px-4 py-2 rounded text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold transition-colors"
                >
                  Save &amp; Log Custody
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 3: CCTV SEARCH REQUEST FORM                                     */}
      {/* ===================================================================== */}
      {isCctvRequestModalOpen && selectedLostItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="card-ait w-full max-w-xl bg-[#0c1322] border-purple-500/40 p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Video className="w-5 h-5 text-purple-400" />
                Request CCTV Footage Investigation
              </h3>
              <button 
                onClick={() => setIsCctvRequestModalOpen(false)}
                className="text-slate-400 hover:text-slate-100 p-1"
              >
                ✕
              </button>
            </div>

            {/* Selected Lost Item Summary */}
            <div className="p-3 rounded-lg bg-purple-950/20 border border-purple-500/20 text-xs space-y-1">
              <div className="text-[10px] font-mono text-purple-400 font-bold">ASSOCIATED LOST REPORT • {selectedLostItem.id}</div>
              <div className="font-bold text-slate-100">{selectedLostItem.itemName} ({selectedLostItem.category})</div>
              <div className="text-slate-400 text-[11px]">Location: {selectedLostItem.lastKnownLocation} | Date: {selectedLostItem.dateLost}</div>
            </div>

            <form onSubmit={handleSubmitCctvRequest} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Target Camera / Monitored Area *</label>
                <select
                  value={cctvForm.preferredCameraId}
                  onChange={(e) => setCctvForm({ ...cctvForm, preferredCameraId: e.target.value })}
                  className="select-ait w-full py-1.5"
                >
                  {cameras.map(c => (
                    <option key={c.id} value={c.id}>
                      [{c.cameraCode}] {c.name} ({c.zone})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500 mt-1">
                  System recommends camera based on authorized camera-location frustum metadata.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Incident Date *</label>
                  <input
                    type="date"
                    required
                    value={cctvForm.incidentDate}
                    onChange={(e) => setCctvForm({ ...cctvForm, incidentDate: e.target.value })}
                    className="input-ait w-full py-1.5"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Start Time *</label>
                  <input
                    type="time"
                    required
                    value={cctvForm.requestedStartTime}
                    onChange={(e) => setCctvForm({ ...cctvForm, requestedStartTime: e.target.value })}
                    className="input-ait w-full py-1.5"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">End Time *</label>
                  <input
                    type="time"
                    required
                    value={cctvForm.requestedEndTime}
                    onChange={(e) => setCctvForm({ ...cctvForm, requestedEndTime: e.target.value })}
                    className="input-ait w-full py-1.5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Legitimate Recovery Purpose &amp; Justification *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Explain why video footage is required to locate the missing property..."
                  value={cctvForm.purpose}
                  onChange={(e) => setCctvForm({ ...cctvForm, purpose: e.target.value })}
                  className="input-ait w-full py-1.5"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Specific Monitored Area Detail (Bench, desk, door)</label>
                <input
                  type="text"
                  placeholder="e.g. Reading table 14 near east window"
                  value={cctvForm.monitoredAreaDetail}
                  onChange={(e) => setCctvForm({ ...cctvForm, monitoredAreaDetail: e.target.value })}
                  className="input-ait w-full py-1.5"
                />
              </div>

              {/* Privacy notice */}
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
                <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Surveillance Governance Clause:</strong> Surveillance access is strictly restricted to approved time ranges and cameras. General users never receive live feeds or unrelated footage. Unrelated bystanders are automatically masked.
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCctvRequestModalOpen(false)}
                  className="px-4 py-2 rounded text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold transition-colors flex items-center gap-1.5"
                >
                  <Video className="w-3.5 h-3.5" />
                  Submit Request for Security Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 4: CCTV REQUEST APPROVAL / REJECTION (SECURITY DESK)            */}
      {/* ===================================================================== */}
      {isCctvApprovalModalOpen && selectedCctvRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="card-ait w-full max-w-lg bg-[#0c1322] border-amber-500/30 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                Surveillance Footage Authorization
              </h3>
              <button 
                onClick={() => setIsCctvApprovalModalOpen(false)}
                className="text-slate-400 hover:text-slate-100 p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded bg-slate-950 border border-slate-800 space-y-1">
                <div className="font-mono text-purple-300 font-bold">{selectedCctvRequest.id}</div>
                <div>Requester: <strong>{selectedCctvRequest.requesterName}</strong> ({selectedCctvRequest.requesterRole})</div>
                <div>Camera: <strong>{selectedCctvRequest.preferredCameraCode}</strong> - {selectedCctvRequest.preferredCameraName}</div>
                <div>Requested Window: <strong>{selectedCctvRequest.incidentDate}</strong> ({selectedCctvRequest.requestedStartTime} - {selectedCctvRequest.requestedEndTime})</div>
                <div className="text-slate-400 pt-1 italic">"{selectedCctvRequest.purpose}"</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Approved Start Time</label>
                  <input
                    type="time"
                    value={approvalDecision.approvedStart}
                    onChange={(e) => setApprovalDecision({ ...approvalDecision, approvedStart: e.target.value })}
                    className="input-ait w-full py-1.5"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Approved End Time</label>
                  <input
                    type="time"
                    value={approvalDecision.approvedEnd}
                    onChange={(e) => setApprovalDecision({ ...approvalDecision, approvedEnd: e.target.value })}
                    className="input-ait w-full py-1.5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Officer Authorization Memo / Reason</label>
                <textarea
                  rows={2}
                  value={approvalDecision.decisionReason}
                  onChange={(e) => setApprovalDecision({ ...approvalDecision, decisionReason: e.target.value })}
                  className="input-ait w-full py-1.5"
                />
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleRejectRequest}
                  className="px-4 py-2 bg-red-600/80 hover:bg-red-600 text-white rounded font-bold"
                >
                  Reject Request
                </button>

                <button
                  type="button"
                  onClick={handleApproveRequest}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold"
                >
                  Approve &amp; Release Footage
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 5: ITEM CLAIM & OWNERSHIP PROOF MODAL                           */}
      {/* ===================================================================== */}
      {isClaimModalOpen && selectedFoundItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="card-ait w-full max-w-lg bg-[#0c1322] border-cyan-500/30 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-cyan-400" />
                Initiate Ownership Claim
              </h3>
              <button 
                onClick={() => setIsClaimModalOpen(false)}
                className="text-slate-400 hover:text-slate-100 p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded bg-cyan-950/20 border border-cyan-500/20 text-xs space-y-1">
              <div className="text-[10px] font-mono text-cyan-400 font-bold">FOUND ITEM • {selectedFoundItem.id}</div>
              <div className="font-bold text-slate-100">{selectedFoundItem.itemName} ({selectedFoundItem.category})</div>
              <div className="text-slate-400 text-[11px]">Held at: {selectedFoundItem.holdingLocation}</div>
            </div>

            <form onSubmit={handleSubmitClaim} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">
                  Proof of Ownership (Questions / Marks Only Owner Knows) *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. 'What is the lock screen wallpaper?', 'What stickers are on the back?', 'Describe the exact keychain attached'..."
                  value={claimForm.proofOfOwnership}
                  onChange={(e) => setClaimForm({ ...claimForm, proofOfOwnership: e.target.value })}
                  className="input-ait w-full py-1.5"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Optional Proof Photo / Receipt URL</label>
                <input
                  type="text"
                  placeholder="https://... (or leave empty)"
                  value={claimForm.proofPhotoUrl}
                  onChange={(e) => setClaimForm({ ...claimForm, proofPhotoUrl: e.target.value })}
                  className="input-ait w-full py-1.5"
                />
              </div>

              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
                <strong>Handover Protocol:</strong> Upon verification, you will receive collection approval to present your institute ID card at <strong>{selectedFoundItem.holdingLocation}</strong>.
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsClaimModalOpen(false)}
                  className="px-4 py-2 rounded text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold"
                >
                  Submit Ownership Verification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 6: SECURE APPROVED CCTV FOOTAGE REVIEW STATION                  */}
      {/* ===================================================================== */}
      {isFootageViewerOpen && selectedCctvRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-md animate-fade-in">
          <div className="card-ait w-full max-w-5xl bg-[#090e17] border-purple-500/40 shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">
            
            {/* Viewer Header */}
            <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
              <div className="flex items-center gap-2.5">
                <Video className="w-5 h-5 text-purple-400" />
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    Authorized CCTV Footage Player • {selectedCctvRequest.preferredCameraCode}
                    <span className="badge-ait bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">
                      AUTHORIZED
                    </span>
                  </h3>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Camera: {selectedCctvRequest.preferredCameraName} | Approved Window: {selectedCctvRequest.approvedStartTime || selectedCctvRequest.requestedStartTime} - {selectedCctvRequest.approvedEndTime || selectedCctvRequest.requestedEndTime}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 hidden sm:inline">
                  Expires: {selectedCctvRequest.accessExpiresAt || '24 hrs'}
                </span>
                <button
                  onClick={() => setIsFootageViewerOpen(false)}
                  className="p-1 rounded text-slate-400 hover:text-slate-100"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Viewer Body: Video Viewport & Sightings Sidebar */}
            <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-3 gap-3 p-4">
              
              {/* Left 2 Cols: Video Player & Scrubbing Controls */}
              <div className="lg:col-span-2 space-y-3">
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center group select-none">
                  
                  {/* Video simulation or stream */}
                  <video
                    src={selectedCctvRequest.sampleVideoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'}
                    autoPlay={isPlaying}
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />

                  {/* Privacy Masking Filter Overlay */}
                  {maskBystanders && (
                    <div className="absolute inset-0 pointer-events-none z-10">
                      {/* Dynamic blurred mask rectangles over bystanders */}
                      <div className="absolute top-[30%] left-[20%] w-24 h-48 bg-white/5 backdrop-blur-md rounded-full border border-cyan-400/30">
                        <span className="text-[9px] font-mono text-cyan-300 bg-black/60 px-1 rounded absolute -top-4 left-0">
                          Bystander Masked
                        </span>
                      </div>
                      <div className="absolute top-[35%] right-[25%] w-20 h-40 bg-white/5 backdrop-blur-md rounded-full border border-cyan-400/30">
                        <span className="text-[9px] font-mono text-cyan-300 bg-black/60 px-1 rounded absolute -top-4 left-0">
                          Bystander Masked
                        </span>
                      </div>
                    </div>
                  )}

                  {/* On-screen Camera OSD Telemetry Banner */}
                  <div className="absolute top-2 left-2 z-20 flex items-center gap-2 px-2.5 py-1 rounded bg-black/80 font-mono text-[10px] text-slate-300 border border-slate-800">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                    <span>{selectedCctvRequest.preferredCameraCode}</span>
                    <span>•</span>
                    <span className="text-amber-300">{selectedCctvRequest.incidentDate}</span>
                    <span>•</span>
                    <span className="text-emerald-400">
                      {selectedCctvRequest.approvedStartTime || '12:00'}:{String(Math.floor(currentTimeOffset / 60)).padStart(2, '0')}:{String(currentTimeOffset % 60).padStart(2, '0')}
                    </span>
                  </div>

                  {/* Mode Badge */}
                  <div className="absolute top-2 right-2 z-20 px-2 py-0.5 rounded bg-black/80 font-mono text-[9px] text-amber-300 border border-amber-500/40">
                    DEMO MODE • AUTHORIZED ARCHIVE
                  </div>

                  {/* Play / Pause Centered Action overlay on hover */}
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-black/60 hover:bg-black/80 border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20"
                  >
                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1 fill-current" />}
                  </button>
                </div>

                {/* Video Playback Controls Bar */}
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                    </button>

                    <button
                      onClick={() => setCurrentTimeOffset(0)}
                      className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
                      title="Rewind to start"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>

                    {/* Timeline Scrubber */}
                    <input
                      type="range"
                      min={0}
                      max={1800} // 30 mins demo buffer
                      value={currentTimeOffset}
                      onChange={(e) => setCurrentTimeOffset(Number(e.target.value))}
                      className="flex-1 accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded"
                    />

                    {/* Timestamp display */}
                    <div className="font-mono text-xs text-amber-300 font-bold shrink-0">
                      +{Math.floor(currentTimeOffset / 60)}m {currentTimeOffset % 60}s
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
                    <div className="flex items-center gap-2">
                      <span>Speed:</span>
                      {[0.5, 1, 1.5, 2, 4].map(spd => (
                        <button
                          key={spd}
                          onClick={() => setPlaybackSpeed(spd)}
                          className={`px-1.5 py-0.5 rounded ${playbackSpeed === spd ? 'bg-amber-500 text-slate-950 font-bold' : 'hover:bg-slate-800 text-slate-400'}`}
                        >
                          {spd}x
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setMaskBystanders(!maskBystanders)}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded border transition-colors ${
                        maskBystanders ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-slate-900 text-slate-400 border-slate-800'
                      }`}
                    >
                      {maskBystanders ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      Privacy Mask: {maskBystanders ? 'ON' : 'OFF'}
                    </button>
                  </div>
                </div>

                {/* Log Sighting at Current Timestamp */}
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider flex items-center gap-1.5">
                    <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                    Bookmark Sighting at Current Timestamp (+{Math.floor(currentTimeOffset / 60)}m {currentTimeOffset % 60}s)
                  </h4>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Student in red hoodie picked up navy backpack from bench..."
                      value={sightingNote}
                      onChange={(e) => setSightingNote(e.target.value)}
                      className="input-ait text-xs flex-1 py-1.5"
                    />
                    <select
                      value={sightingConfidence}
                      onChange={(e) => setSightingConfidence(e.target.value as any)}
                      className="select-ait text-xs py-1.5"
                    >
                      <option value="HIGH">High Confidence</option>
                      <option value="MODERATE">Moderate</option>
                      <option value="TENTATIVE">Tentative</option>
                    </select>
                    <button
                      onClick={handleAddSighting}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded transition-colors shrink-0"
                    >
                      Bookmark
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Col: Sightings Ledger & Search Outcome Finalization */}
              <div className="space-y-3 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider mb-2 flex items-center justify-between">
                    <span>Recorded Sightings ({selectedCctvRequest.sightings.length})</span>
                    <span className="text-[10px] text-slate-500">Timeline bookmarks</span>
                  </h4>

                  <div className="space-y-2 max-h-[220px] overflow-y-auto">
                    {selectedCctvRequest.sightings.length === 0 ? (
                      <div className="text-xs text-slate-500 text-center py-6 border border-dashed border-slate-800 rounded">
                        No sightings bookmarked yet. Scrub the footage and click "Bookmark".
                      </div>
                    ) : (
                      selectedCctvRequest.sightings.map(s => (
                        <div 
                          key={s.id} 
                          onClick={() => setCurrentTimeOffset(s.timestampOffsetSeconds)}
                          className="p-2.5 rounded bg-slate-950 border border-slate-800 text-xs space-y-1 hover:border-amber-500/40 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center justify-between font-mono text-[11px]">
                            <span className="text-amber-300 font-bold">⏱ {s.formattedTimestamp}</span>
                            <span className={`px-1.5 py-0.2 rounded text-[9px] ${
                              s.confidence === 'HIGH' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-300'
                            }`}>
                              {s.confidence}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 line-clamp-2">{s.notes}</p>
                          <div className="text-[10px] text-slate-500">By {s.recordedBy}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Finalize CCTV Search Outcome Form */}
                <div className="p-3.5 rounded-lg bg-slate-950 border border-purple-500/30 space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                    Finalize CCTV Search Outcome
                  </h4>
                  
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Search Result Decision *</label>
                    <select
                      value={finalResultChoice}
                      onChange={(e) => setFinalResultChoice(e.target.value as any)}
                      className="select-ait w-full py-1 text-xs"
                    >
                      <option value="Item Located">Item Located (Recovery Confirmed)</option>
                      <option value="Possible Sighting">Possible Sighting (Escalate to Guard)</option>
                      <option value="No Useful Sighting">No Useful Sighting (Search Completed)</option>
                      <option value="Request Further Assistance">Request Further Assistance</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Investigation Notes</label>
                    <input
                      type="text"
                      placeholder="Add closing memo or guard alert notes..."
                      value={finalResultNote}
                      onChange={(e) => setFinalResultNote(e.target.value)}
                      className="input-ait w-full py-1 text-xs"
                    />
                  </div>

                  <button
                    onClick={handleFinalizeSearch}
                    className="w-full py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded transition-colors"
                  >
                    Save Search Outcome
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};

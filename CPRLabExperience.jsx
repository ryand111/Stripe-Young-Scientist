import React, { useState, useEffect, useRef } from "react";
import {
  Heart,
  Play,
  RotateCcw,
  ChevronRight,
  User,
  Music,
  ClipboardList,
  CheckCircle2,
  XCircle,
  Award,
  Lock,
  Trash2,
  BarChart3,
  PieChart,
  HelpCircle,
  BookOpen,
  ChevronDown,
  Check,
  Eye,
  X,
  Compass,
  Zap,
  Activity,
  Sliders,
  Volume2,
  Hand,
  Users,
  LineChart,
} from "lucide-react";

export default function CPRLabExperience() {
  // Main Navigation State
  const [activeTab, setActiveTab] = useState("student");
  const [judgeSubTab, setJudgeSubTab] = useState("table");

  // Student Identity & Page Navigation Tracking
  const [userName, setUserName] = useState("");
  const [isNameSubmitted, setIsNameSubmitted] = useState(false);
  const [visitedPages, setVisitedPages] = useState([]);

  // Pop-up Card Modal State for Judge Panel
  const [selectedStudentCard, setSelectedStudentCard] = useState(null);

  // --- Password Protection State ---
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [isJudgeAuthenticated, setIsJudgeAuthenticated] = useState(false);

  // --- AED & Response Check Mini-Game State ---
  const [aedStep, setAedStep] = useState(0);
  const [responseChecked, setResponseChecked] = useState(false);

  // --- AED Visual Guide Animation State (Adult vs Pediatric) ---
  const [padBodyType, setPadBodyType] = useState("adult"); // "adult" or "pediatric"
  const [showAedGuideModal, setShowAedGuideModal] = useState(false);

  // --- CPR Simulator & Benchmark State ---
  const COMPRESSION_LIMIT = 30;
  const [targetBpm, setTargetBpm] = useState(103);
  const MS_PER_BEAT = (60 / targetBpm) * 1000;

  const PRIMARY_AUDIO = "/staying-alive.mp3";
  const BACKUP_AUDIO =
    "https://archive.org/download/thebestofdisco/Bee%20Gees%20-%20Stayin%27%20Alive.mp3";

  const [simulationActive, setSimulationActive] = useState(false);
  const [compressionsLeft, setCompressionsLeft] = useState(COMPRESSION_LIMIT);
  const [lastTapTime, setLastTapTime] = useState(null);
  const [accuracyLog, setAccuracyLog] = useState([]);
  const [showResultCard, setShowResultCard] = useState(false);
  const [latestResult, setLatestResult] = useState(null);
  const [visualMetronomeColor, setVisualMetronomeColor] =
    useState("bg-slate-700/50");

  // Live Feedback State
  const [liveFeedback, setLiveFeedback] = useState(null);

  // --- Multiplayer / Team Relay Mode State ---
  const [isRelayMode, setIsRelayMode] = useState(false);
  const [relayTeamNames, setRelayTeamNames] = useState([
    "Student 1",
    "Student 2",
  ]);
  const [currentRelayIndex, setCurrentRelayIndex] = useState(0);
  const [relayScores, setRelayScores] = useState([]);
  const [relayActive, setRelayActive] = useState(false);

  // Audio Voice Prompt Helper using Web Speech API
  const speakText = (text) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  // LocalStorage Persistent Records
  const [judgeRecords, setJudgeRecords] = useState(() => {
    try {
      const saved = localStorage.getItem("cpr_judge_records");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("cpr_judge_records", JSON.stringify(judgeRecords));
  }, [judgeRecords]);

  const intervalIdRef = useRef(null);
  const audioRef = useRef(null);

  // --- Quiz State ---
  const [quizAnswers, setQuizAnswers] = useState({
    confidence: "",
    knowledge: "",
    hesitation: "",
  });
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // --- Accordion State for Myths & Facts ---
  const [openMythIndex, setOpenMythIndex] = useState(null);

  const mythsList = [
    {
      myth: "You must perform mouth-to-mouth resuscitation for CPR to work.",
      fact: "Hands-Only CPR (continuous chest compressions) is proven to be just as effective as traditional CPR with rescue breaths in the first few minutes of out-of-hospital sudden cardiac arrest.",
    },
    {
      myth: "If you break a victim's rib during chest compressions, you are doing CPR wrong.",
      fact: "Rib fractures or popping cartilage are very common during high-quality CPR compressions. Pushing hard enough (at least 2 inches deep) is crucial to circulate blood to the brain.",
    },
    {
      myth: "You can be sued if you perform CPR on someone and they suffer injuries.",
      fact: "Good Samaritan laws exist in almost all jurisdictions to legally protect individuals who provide emergency CPR assistance in good faith.",
    },
    {
      myth: "An Automated External Defibrillator (AED) will shock someone by mistake if they don't need it.",
      fact: "AEDs automatically analyze the victim's heart rhythm and will only deliver or allow a shock if a shockable rhythm (like V-Fib) is detected.",
    },
    {
      myth: "CPR will restart a completely stopped heart immediately.",
      fact: "CPR does not usually restart a heart directly; its primary purpose is to manually pump oxygenated blood to the brain and vital organs until an AED or paramedic team arrives.",
    },
  ];

  const navigateToTab = (tabName) => {
    setActiveTab(tabName);
    if (isNameSubmitted && !visitedPages.includes(tabName)) {
      setVisitedPages((prev) => [...prev, tabName]);
    }
  };

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (userName.trim()) {
      setIsNameSubmitted(true);
      setVisitedPages(["student"]);
    }
  };

  const handleShakeAndShout = () => {
    setResponseChecked(true);
    speakText("Hello hello can you hear me hello hello");
    setLiveFeedback({
      text: "SHAKEN & SHOUTED: 'Hello hello can you hear me hello hello'",
      color: "bg-blue-500/20 text-blue-300 border-blue-500/40",
    });
  };

  const startSimulation = () => {
    if (!responseChecked && !isRelayMode) return;
    setSimulationActive(true);
    setCompressionsLeft(COMPRESSION_LIMIT);
    setAccuracyLog([]);
    setShowResultCard(false);
    setLastTapTime(null);
    setLiveFeedback({
      text: "START COMPRESSIONS!",
      color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    });
    setVisualMetronomeColor("bg-slate-700/50");
    speakText("Start chest compressions. Keep the rhythm.");

    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      const playPromise = audioRef.current.play();

      if (playPromise !== undefined) {
        playPromise.catch(() => {
          if (audioRef.current.src !== BACKUP_AUDIO) {
            audioRef.current.src = BACKUP_AUDIO;
            audioRef.current.currentTime = 0;
            audioRef.current
              .play()
              .catch((e) => console.log("Audio error:", e));
          }
        });
      }
    }

    intervalIdRef.current = setInterval(() => {
      setVisualMetronomeColor("bg-emerald-500/20");
      setTimeout(() => setVisualMetronomeColor("bg-slate-700/50"), 150);
    }, MS_PER_BEAT);
  };

  const stopSimulation = (log) => {
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    setSimulationActive(false);
    setLiveFeedback(null);

    if (log && log.length > 0) {
      const perfectTaps = log.filter((tap) => tap.rating === "Perfect").length;
      const goodTaps = log.filter((tap) => tap.rating === "Good").length;
      const scorePercentage = Math.round(
        ((perfectTaps * 1 + goodTaps * 0.7) / COMPRESSION_LIMIT) * 100
      );

      const intervals = log
        .filter((t) => t.timeSinceLast)
        .map((t) => t.timeSinceLast);
      const avgMs =
        intervals.length > 0
          ? intervals.reduce((a, b) => a + b, 0) / intervals.length
          : MS_PER_BEAT;
      const userCalculatedBPM = Math.round(60000 / avgMs);

      const isPassed = scorePercentage >= 65;

      const currentStudentName = isRelayMode
        ? relayTeamNames[currentRelayIndex] ||
          `Rescuer ${currentRelayIndex + 1}`
        : userName || "Anonymous";

      const resultObject = {
        id: Date.now(),
        name: currentStudentName,
        score: scorePercentage,
        passed: isPassed,
        targetBPM: targetBpm,
        actualBPM: userCalculatedBPM,
        totalCompressions: COMPRESSION_LIMIT - compressionsLeft,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        pagesVisited: visitedPages.length > 0 ? visitedPages : ["student"],
        survey: quizAnswers.confidence ? { ...quizAnswers } : null,
      };

      if (isRelayMode) {
        setRelayScores((prev) => [...prev, resultObject]);
        if (currentRelayIndex + 1 < relayTeamNames.length) {
          setCurrentRelayIndex((prev) => prev + 1);
          setCompressionsLeft(COMPRESSION_LIMIT);
          setAccuracyLog([]);
          return;
        } else {
          setRelayActive(false);
        }
      }

      setLatestResult(resultObject);
      setShowResultCard(true);

      setJudgeRecords((prev) => {
        const filtered = prev.filter(
          (r) => r.name.toLowerCase() !== currentStudentName.toLowerCase()
        );
        return [resultObject, ...filtered];
      });
    }
  };

  const handleCompressionTap = () => {
    if (!simulationActive || compressionsLeft <= 0) return;

    const currentTapTime = Date.now();
    const newCount = compressionsLeft - 1;
    setCompressionsLeft(newCount);

    let tapAccuracy = {
      msDiff: 0,
      rating: "Perfect",
      timeSinceLast: 0,
      bpmRecorded: targetBpm,
    };

    if (lastTapTime) {
      const timeSinceLastTap = currentTapTime - lastTapTime;
      const instantBpm = Math.round(60000 / timeSinceLastTap);

      if (timeSinceLastTap < MS_PER_BEAT * 0.75) {
        tapAccuracy = {
          msDiff: Math.round(timeSinceLastTap),
          rating: "Too Fast",
          timeSinceLast: timeSinceLastTap,
          bpmRecorded: instantBpm,
        };
        setLiveFeedback({
          text: "⚡ TOO FAST! SLOW DOWN",
          color: "bg-amber-500/20 text-amber-300 border-amber-500/40",
        });
      } else if (timeSinceLastTap > MS_PER_BEAT * 1.35) {
        tapAccuracy = {
          msDiff: Math.round(timeSinceLastTap),
          rating: "Too Slow",
          timeSinceLast: timeSinceLastTap,
          bpmRecorded: instantBpm,
        };
        setLiveFeedback({
          text: "🐢 TOO SLOW! SPEED UP",
          color: "bg-rose-500/20 text-rose-300 border-rose-500/40",
        });
      } else {
        const offsetFromTarget = Math.abs(timeSinceLastTap - MS_PER_BEAT);
        const rating =
          offsetFromTarget < MS_PER_BEAT * 0.15 ? "Perfect" : "Good";
        tapAccuracy = {
          msDiff: Math.round(offsetFromTarget),
          rating,
          timeSinceLast: timeSinceLastTap,
          bpmRecorded: instantBpm,
        };
        setLiveFeedback({
          text: "🎯 PERFECT RHYTHM!",
          color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
        });
      }
    } else {
      setLiveFeedback({
        text: "KEEP THE BEAT!",
        color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
      });
    }

    const newAccuracyLog = [...accuracyLog, tapAccuracy];
    setAccuracyLog(newAccuracyLog);
    setLastTapTime(currentTapTime);

    if (newCount === 0) {
      stopSimulation(newAccuracyLog);
    }
  };

  const handleJudgeClick = () => {
    if (isJudgeAuthenticated) {
      setActiveTab("judges");
    } else {
      setShowPasswordModal(true);
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordInput === "YSTE2027admin") {
      setIsJudgeAuthenticated(true);
      setShowPasswordModal(false);
      setPasswordInput("");
      setPasswordError(false);
      setActiveTab("judges");
    } else {
      setPasswordError(true);
    }
  };

  const handleQuizSubmit = (e) => {
    e.preventDefault();
    if (quizAnswers.confidence && quizAnswers.knowledge) {
      setQuizSubmitted(true);
      setJudgeRecords((prev) =>
        prev.map((rec) => {
          if (rec.name.toLowerCase() === userName.toLowerCase()) {
            return { ...rec, survey: { ...quizAnswers } };
          }
          return rec;
        })
      );
    }
  };

  const totalAttempts = judgeRecords.length;
  const passCount = judgeRecords.filter((r) => r.passed).length;
  const failCount = totalAttempts - passCount;
  const passRatePercentage =
    totalAttempts > 0 ? Math.round((passCount / totalAttempts) * 100) : 0;
  const failRatePercentage = totalAttempts > 0 ? 100 - passRatePercentage : 0;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col items-center justify-start p-4 md:p-8">
      <audio
        ref={audioRef}
        src={PRIMARY_AUDIO}
        preload="auto"
        onError={() => {
          if (audioRef.current && audioRef.current.src !== BACKUP_AUDIO) {
            audioRef.current.src = BACKUP_AUDIO;
          }
        }}
      />

      {/* Header */}
      <header className="w-full max-w-5xl bg-slate-800 border border-slate-700 rounded-2xl p-4 shadow-xl mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-2xl font-black text-slate-950 shadow-lg shadow-emerald-500/20">
            🦓
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white">
              Stripey CPR Trainer
            </h1>
            <p className="text-xs text-slate-400">
              Rhythm Simulator & Analytics Hub
            </p>
          </div>
        </div>

        {isNameSubmitted && (
          <div className="flex flex-wrap bg-slate-900 p-1 rounded-xl border border-slate-700 gap-1 animate-in fade-in duration-300">
            <button
              onClick={() => navigateToTab("student")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "student"
                  ? "bg-emerald-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Simulator
            </button>

            <button
              onClick={() => navigateToTab("leaderboard")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                activeTab === "leaderboard"
                  ? "bg-emerald-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Award className="w-3.5 h-3.5" /> Leaderboard
            </button>

            <button
              onClick={() => navigateToTab("quiz")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                activeTab === "quiz"
                  ? "bg-emerald-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" /> CPR Quiz
            </button>

            <button
              onClick={() => navigateToTab("myths")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                activeTab === "myths"
                  ? "bg-emerald-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" /> Myths vs Facts
            </button>

            <button
              onClick={handleJudgeClick}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "judges"
                  ? "bg-emerald-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Lock className="w-3.5 h-3.5" /> Judge Panel (
              {judgeRecords.length})
            </button>
          </div>
        )}
      </header>

      {/* Main Container */}
      <main className="w-full max-w-5xl bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-2xl relative">
        {!isNameSubmitted ? (
          <div className="max-w-md mx-auto py-12 space-y-6 text-center">
            <div className="w-16 h-16 bg-slate-900 border border-slate-700 rounded-full flex items-center justify-center mx-auto text-emerald-400 shadow-inner">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">
                Enter Your Name To Begin
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Entering your name unlocks the CPR simulator, leaderboard, quiz,
                and learning modules.
              </p>
            </div>
            <form onSubmit={handleNameSubmit} className="space-y-4">
              <input
                type="text"
                required
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter Student Name"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-center font-semibold focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                Start Learning & Testing <ChevronRight className="w-5 h-5" />
              </button>
            </form>
          </div>
        ) : (
          <>
            {/* TAB 1: STUDENT SIMULATOR */}
            {activeTab === "student" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center bg-slate-900/60 p-4 rounded-xl border border-slate-700">
                  <div className="flex items-center gap-2">
                    <User className="text-emerald-400 w-5 h-5" />
                    <span className="font-bold text-white">
                      {isRelayMode
                        ? `Relay Team (${relayTeamNames[currentRelayIndex]})`
                        : userName}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowAedGuideModal(true)}
                      className="text-xs bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Zap className="w-3.5 h-3.5" /> AED Pad Guide
                    </button>
                    <button
                      onClick={() => {
                        setIsNameSubmitted(false);
                        stopSimulation([]);
                        setAedStep(0);
                        setResponseChecked(false);
                      }}
                      className="text-xs text-slate-400 hover:text-slate-200 underline"
                    >
                      Change Name
                    </button>
                  </div>
                </div>

                {/* MULTIPLAYER / TEAM RELAY MODE TOGGLE & SETUP */}
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-emerald-400" />
                      <h3 className="text-sm font-bold text-white">
                        Multiplayer & Team Relay Mode (30 Compressions per
                        Student Handoff)
                      </h3>
                    </div>
                    <button
                      onClick={() => {
                        setIsRelayMode(!isRelayMode);
                        setCurrentRelayIndex(0);
                        setRelayScores([]);
                      }}
                      className={`text-xs font-extrabold px-3 py-1.5 rounded-lg border transition-all ${
                        isRelayMode
                          ? "bg-emerald-500 text-slate-950 border-emerald-400"
                          : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                      }`}
                    >
                      {isRelayMode ? "Relay Mode Active" : "Enable Relay Mode"}
                    </button>
                  </div>

                  {isRelayMode && (
                    <div className="space-y-3 pt-2 border-t border-slate-800">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] text-slate-400 font-bold block mb-1">
                            Rescuer 1 Name
                          </label>
                          <input
                            type="text"
                            value={relayTeamNames[0]}
                            onChange={(e) =>
                              setRelayTeamNames([
                                e.target.value,
                                relayTeamNames[1],
                              ])
                            }
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-slate-400 font-bold block mb-1">
                            Rescuer 2 Name
                          </label>
                          <input
                            type="text"
                            value={relayTeamNames[1]}
                            onChange={(e) =>
                              setRelayTeamNames([
                                relayTeamNames[0],
                                e.target.value,
                              ])
                            }
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                          />
                        </div>
                      </div>
                      <div className="text-xs text-emerald-400 font-bold flex items-center justify-between bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20">
                        <span>
                          Current Turn: {relayTeamNames[currentRelayIndex]}
                        </span>
                        <span>
                          Completed Handoffs: {relayScores.length} /{" "}
                          {relayTeamNames.length}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* LIVE PACE FEEDBACK BANNER */}
                {simulationActive && liveFeedback && (
                  <div
                    className={`p-3 rounded-xl border font-black text-center text-sm tracking-wide transition-all animate-pulse ${liveFeedback.color}`}
                  >
                    {liveFeedback.text}
                  </div>
                )}

                {/* PROTOCOL STEP 1: SHAKE AND SHOUT */}
                {aedStep === 0 && !responseChecked && !isRelayMode && (
                  <div className="bg-slate-900 p-6 rounded-2xl border-2 border-emerald-500/40 text-center space-y-4 animate-in fade-in">
                    <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto animate-pulse">
                      <Hand className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-white">
                      Step 1: Shake and Shout
                    </h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Shake gently and shout:{" "}
                      <span className="text-emerald-300 font-bold">
                        "Hello hello can you hear me hello hello"
                      </span>
                    </p>
                    <button
                      onClick={handleShakeAndShout}
                      className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-6 py-3 rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-2 mx-auto"
                    >
                      <Volume2 className="w-4 h-4" /> SHAKE & SHOUT "Hello
                      hello..."
                    </button>
                  </div>
                )}

                {/* PROTOCOL STEP 2: CHECK BREATHING & DIRECT HELP */}
                {aedStep === 0 && responseChecked && !isRelayMode && (
                  <div className="bg-slate-900 p-6 rounded-2xl border-2 border-amber-500/40 text-center space-y-4 animate-in fade-in">
                    <div className="w-16 h-16 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto">
                      <Activity className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-white">
                      Step 2: Check Breathing & Direct Help
                    </h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Check for rise and fall of the chest. No breathing
                      detected? Direct someone to get an AED and another to ring
                      999.
                    </p>
                    <button
                      onClick={() => {
                        speakText("Get an AED and ring 999. Start CPR.");
                        setAedStep(1);
                      }}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-3 rounded-xl text-xs transition-all shadow-lg shadow-amber-500/25 flex items-center gap-2 mx-auto"
                    >
                      <Zap className="w-4 h-4" /> NO BREATHING: GET AED & RING
                      999
                    </button>
                  </div>
                )}

                {/* PROTOCOL STEP 3: AED ARRIVAL, V-FIB CHECK & SHOCK */}
                {aedStep > 0 && aedStep < 4 && !isRelayMode && (
                  <div className="bg-slate-900 p-6 rounded-2xl border-2 border-blue-500/40 space-y-4 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <span className="text-xs font-black uppercase text-blue-400 tracking-wider flex items-center gap-1.5">
                        <Zap className="w-4 h-4" /> AED Protocol Step {aedStep}{" "}
                        of 3
                      </span>
                      <button
                        onClick={() => {
                          setAedStep(0);
                          setResponseChecked(false);
                        }}
                        className="text-xs text-slate-400 hover:text-white"
                      >
                        Reset Protocol
                      </button>
                    </div>

                    {aedStep === 1 && (
                      <div className="text-center py-6 space-y-4">
                        <div className="w-16 h-16 bg-blue-500/20 text-blue-400 border border-blue-500/40 rounded-full flex items-center justify-center mx-auto">
                          <Zap className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-white">
                          Step A: AED Arrives — Apply Pads
                        </h3>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto">
                          Once AED arrives, apply pads to the victim's bare
                          chest. Click AED Pad Guide above for exact adult vs
                          pediatric placement.
                        </p>
                        <button
                          onClick={() => {
                            speakText("Applying pads. Looking for V-FIB.");
                            setAedStep(2);
                          }}
                          className="bg-blue-500 hover:bg-blue-400 text-white font-black px-6 py-3 rounded-xl text-xs transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2 mx-auto"
                        >
                          <Volume2 className="w-4 h-4" /> APPLY PADS TO CHEST
                        </button>
                      </div>
                    )}

                    {aedStep === 2 && (
                      <div className="text-center py-6 space-y-4">
                        <div className="w-16 h-16 bg-purple-500/20 text-purple-400 border border-purple-500/40 rounded-full flex items-center justify-center mx-auto animate-pulse">
                          <Activity className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-white">
                          Step B: Analyze Rhythm for V-FIB
                        </h3>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto">
                          AED analyzing heart rhythm... Look for ventricular
                          fibrillation (V-FIB).
                        </p>
                        <button
                          onClick={() => {
                            speakText("V-FIB detected. Stand clear and shock.");
                            setAedStep(3);
                          }}
                          className="bg-purple-600 hover:bg-purple-500 text-white font-black px-6 py-3 rounded-xl text-xs transition-all shadow-lg shadow-purple-600/30 flex items-center gap-2 mx-auto"
                        >
                          <Volume2 className="w-4 h-4" /> DETECT V-FIB
                        </button>
                      </div>
                    )}

                    {aedStep === 3 && (
                      <div className="text-center py-6 space-y-4">
                        <div className="w-16 h-16 bg-rose-500/20 text-rose-400 border border-rose-500/40 rounded-full flex items-center justify-center mx-auto animate-bounce">
                          <Zap className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-white">
                          Step C: Deliver Shock
                        </h3>
                        <p className="text-xs text-rose-300 max-w-sm mx-auto font-semibold">
                          V-FIB confirmed. Stand clear of patient and deliver
                          shock.
                        </p>
                        <button
                          onClick={() => {
                            speakText(
                              "Shock delivered. Begin CPR compressions."
                            );
                            setAedStep(4);
                          }}
                          className="bg-rose-600 hover:bg-rose-500 text-white font-black px-8 py-3 rounded-xl text-xs transition-all shadow-lg shadow-rose-600/30 flex items-center gap-2 mx-auto"
                        >
                          <Volume2 className="w-4 h-4" /> ⚡ SHOCK & START CPR
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <div className="grid md:grid-cols-[1fr,240px] gap-6 items-start">
                  <div className="bg-slate-900/80 p-8 rounded-2xl border border-slate-700 flex flex-col items-center justify-center min-h-[300px] relative overflow-hidden">
                    <div
                      className={`absolute inset-0 ${visualMetronomeColor} transition-colors duration-100 z-0`}
                    ></div>

                    <button
                      onClick={handleCompressionTap}
                      disabled={!simulationActive || compressionsLeft <= 0}
                      className={`group w-48 h-48 rounded-full overflow-hidden border-4 border-emerald-500/50 flex flex-col items-center justify-center relative z-10 transition-all ${
                        simulationActive
                          ? "hover:scale-105 shadow-2xl shadow-emerald-500/30 cursor-pointer"
                          : "opacity-80"
                      } disabled:opacity-50`}
                    >
                      <img
                        src="brayden_basic.png"
                        alt="Brayden Basic CPR Manikin"
                        className="absolute inset-0 w-full h-full object-cover filter brightness-75 group-hover:brightness-90 transition-all"
                      />
                      <div className="absolute inset-0 bg-slate-950/40 group-hover:bg-slate-950/20 transition-all"></div>
                      <Heart className="w-10 h-10 text-emerald-400 relative z-10 mb-1 drop-shadow" />
                      <span className="relative z-10 text-[11px] font-black text-white tracking-wider uppercase bg-slate-900/80 px-2 py-0.5 rounded-md border border-slate-700">
                        {simulationActive ? "TAP CHEST" : "DUMMY READY"}
                      </span>
                    </button>

                    <div className="text-center space-y-1 mt-6 relative z-10">
                      <span className="text-6xl font-black text-white">
                        {compressionsLeft}
                      </span>
                      <span className="text-xs text-slate-400 uppercase tracking-widest block font-bold">
                        Compressions Remaining (Target Pace: {targetBpm} BPM)
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div
                      className={`flex items-center gap-3 p-4 rounded-xl border text-sm ${
                        simulationActive
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                          : "bg-slate-900 border-slate-700 text-slate-400"
                      }`}
                    >
                      <Music
                        className={`w-6 h-6 ${
                          simulationActive
                            ? "text-emerald-400 animate-pulse"
                            : ""
                        }`}
                      />
                      <div>
                        <span className="font-bold">Stayin' Alive Beat</span>
                        <p className="text-xs font-semibold">
                          Target: {targetBpm} BPM
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={startSimulation}
                        disabled={
                          simulationActive || (!isRelayMode && aedStep !== 4)
                        }
                        className="p-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 disabled:opacity-30"
                      >
                        <Play className="w-4 h-4" /> START CPR
                      </button>
                      <button
                        onClick={() => {
                          stopSimulation([]);
                          setCompressionsLeft(COMPRESSION_LIMIT);
                          setShowResultCard(false);
                          setAedStep(0);
                          setResponseChecked(false);
                        }}
                        disabled={simulationActive}
                        className="p-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 disabled:opacity-30"
                      >
                        <RotateCcw className="w-4 h-4" /> RESET
                      </button>
                    </div>
                  </div>
                </div>

                {/* REAL-TIME ACCURACY SVG LINE GRAPH */}
                <div className="bg-slate-900 p-5 rounded-2xl border border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <LineChart className="w-5 h-5 text-emerald-400" />
                      <h3 className="text-sm font-bold text-white">
                        Real-Time Speed Consistency Graph (BPM over Intervals)
                      </h3>
                    </div>
                    <span className="text-xs text-slate-400 font-semibold">
                      Target: {targetBpm} BPM
                    </span>
                  </div>

                  {accuracyLog.length === 0 ? (
                    <div className="h-36 flex items-center justify-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                      Start tapping chest compressions to render real-time SVG
                      consistency graph...
                    </div>
                  ) : (
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                      <svg
                        className="w-full h-40 overflow-visible"
                        viewBox="0 0 300 120"
                      >
                        <line
                          x1="0"
                          y1="60"
                          x2="300"
                          y2="60"
                          stroke="#334155"
                          strokeDasharray="4"
                          strokeWidth="1.5"
                        />
                        {(() => {
                          const points = accuracyLog
                            .map((log, idx) => {
                              const x =
                                (idx / Math.max(accuracyLog.length - 1, 1)) *
                                  280 +
                                10;
                              const clampedBpm = Math.max(
                                60,
                                Math.min(180, log.bpmRecorded || targetBpm)
                              );
                              const y = 110 - ((clampedBpm - 60) / 120) * 100;
                              return `${x},${y}`;
                            })
                            .join(" ");

                          return (
                            <>
                              <polyline
                                fill="none"
                                stroke="#10b981"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                points={points}
                              />
                              {accuracyLog.map((log, idx) => {
                                const x =
                                  (idx / Math.max(accuracyLog.length - 1, 1)) *
                                    280 +
                                  10;
                                const clampedBpm = Math.max(
                                  60,
                                  Math.min(180, log.bpmRecorded || targetBpm)
                                );
                                const y = 110 - ((clampedBpm - 60) / 120) * 100;
                                return (
                                  <circle
                                    key={idx}
                                    cx={x}
                                    cy={y}
                                    r="3.5"
                                    className="fill-emerald-400 stroke-slate-900"
                                    strokeWidth="1.5"
                                  />
                                );
                              })}
                            </>
                          );
                        })()}
                      </svg>
                      <div className="flex justify-between text-[10px] text-slate-500 font-bold mt-2">
                        <span>Start of Set</span>
                        <span>Compression Sequence Progression</span>
                        <span>End of Set</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: LEADERBOARD SECTION */}
            {activeTab === "leaderboard" && (
              <div className="space-y-6 max-w-3xl mx-auto py-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-700 pb-4 gap-4">
                  <div>
                    <h2 className="text-2xl font-black text-white flex items-center gap-2">
                      <Award className="text-emerald-400" /> Global Leaderboard
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Top CPR rescuers ranked by precision score and rhythm
                      stability.
                    </p>
                  </div>
                </div>

                {judgeRecords.length === 0 ? (
                  <div className="text-center py-16 space-y-3 bg-slate-900/40 rounded-xl border border-slate-700">
                    <Award className="w-12 h-12 text-slate-600 mx-auto" />
                    <p className="text-slate-400 font-semibold">
                      No records on the leaderboard yet. Complete a simulator
                      session to rank!
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto bg-slate-900/60 rounded-2xl border border-slate-700 p-4">
                    <table className="w-full text-left text-sm text-slate-300">
                      <thead className="bg-slate-900 text-xs uppercase font-extrabold text-slate-400">
                        <tr>
                          <th className="p-3 rounded-l-lg">Rank</th>
                          <th className="p-3">Rescuer Name</th>
                          <th className="p-3">Score</th>
                          <th className="p-3">Recorded BPM</th>
                          <th className="p-3 text-right rounded-r-lg">
                            Timestamp
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/50">
                        {[...judgeRecords]
                          .sort((a, b) => b.score - a.score)
                          .map((rec, index) => (
                            <tr
                              key={rec.id}
                              className="hover:bg-slate-700/40 transition-colors"
                            >
                              <td className="p-3 font-black text-white">
                                {index === 0
                                  ? "🥇 1st"
                                  : index === 1
                                  ? "🥈 2nd"
                                  : index === 2
                                  ? "🥉 3rd"
                                  : `#${index + 1}`}
                              </td>
                              <td className="p-3 font-bold text-white">
                                {rec.name}
                              </td>
                              <td className="p-3 font-extrabold text-emerald-400">
                                {rec.score}%
                              </td>
                              <td className="p-3 font-bold text-slate-300">
                                {rec.actualBPM} BPM
                              </td>
                              <td className="p-3 text-right text-xs text-slate-400">
                                {rec.timestamp}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: CPR CONFIDENCE QUIZ */}
            {activeTab === "quiz" && (
              <div className="space-y-6 max-w-2xl mx-auto py-4">
                <div className="text-center space-y-2 border-b border-slate-700 pb-4">
                  <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl flex items-center justify-center mx-auto">
                    <HelpCircle className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-black text-white">
                    CPR Preparedness & Confidence Survey
                  </h2>
                  <p className="text-xs text-slate-400">
                    Share your thoughts on performing CPR during an emergency.
                  </p>
                </div>

                {quizSubmitted ? (
                  <div className="bg-slate-900 p-8 rounded-2xl border border-slate-700 text-center space-y-4">
                    <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto">
                      <Check className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-white">
                      Survey Completed!
                    </h3>
                    <p className="text-sm text-slate-400">
                      Your answers have been recorded under your student profile
                      in the Judges Panel.
                    </p>
                    <button
                      onClick={() => setQuizSubmitted(false)}
                      className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-6 py-2.5 rounded-xl transition-all"
                    >
                      Update Answers
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={handleQuizSubmit}
                    className="space-y-6 bg-slate-900/60 p-6 rounded-2xl border border-slate-700"
                  >
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-white block">
                        1. Would you feel confident performing hands-only CPR on
                        a stranger in public?
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          "Extremely Confident",
                          "Somewhat Confident",
                          "Unsure / Hesitant",
                          "Not Confident At All",
                        ].map((option) => (
                          <button
                            type="button"
                            key={option}
                            onClick={() =>
                              setQuizAnswers({
                                ...quizAnswers,
                                confidence: option,
                              })
                            }
                            className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                              quizAnswers.confidence === option
                                ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                                : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750"
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-bold text-white block">
                        2. Do you know the exact chest compression rate needed
                        for CPR?
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          "Yes (100–120 BPM)",
                          "No, not sure",
                          "I think it is faster",
                          "I think it is slower",
                        ].map((option) => (
                          <button
                            type="button"
                            key={option}
                            onClick={() =>
                              setQuizAnswers({
                                ...quizAnswers,
                                knowledge: option,
                              })
                            }
                            className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                              quizAnswers.knowledge === option
                                ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                                : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750"
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-bold text-white block">
                        3. What would prevent you from taking action in an
                        emergency?
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          "Fear of hurting victim",
                          "Fear of legal consequences",
                          "Panic / Stress",
                          "Nothing, I would act",
                        ].map((option) => (
                          <button
                            type="button"
                            key={option}
                            onClick={() =>
                              setQuizAnswers({
                                ...quizAnswers,
                                hesitation: option,
                              })
                            }
                            className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                              quizAnswers.hesitation === option
                                ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                                : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750"
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={
                        !quizAnswers.confidence || !quizAnswers.knowledge
                      }
                      className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold py-3 rounded-xl transition-all disabled:opacity-40"
                    >
                      Submit CPR Survey
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* TAB 3: MYTHS VS FACTS ACCORDION */}
            {activeTab === "myths" && (
              <div className="space-y-6 max-w-3xl mx-auto py-4">
                <div className="text-center space-y-2 border-b border-slate-700 pb-4">
                  <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl flex items-center justify-center mx-auto">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-black text-white">
                    CPR Myths vs. Facts
                  </h2>
                  <p className="text-xs text-slate-400">
                    Click any myth to reveal the life-saving fact behind it.
                  </p>
                </div>

                <div className="space-y-3">
                  {mythsList.map((item, idx) => {
                    const isOpen = openMythIndex === idx;
                    return (
                      <div
                        key={idx}
                        className="bg-slate-900/80 border border-slate-700 rounded-xl overflow-hidden transition-all"
                      >
                        <button
                          onClick={() => setOpenMythIndex(isOpen ? null : idx)}
                          className="w-full p-4 text-left font-bold text-sm text-rose-300 flex justify-between items-center hover:bg-slate-800/50 transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            <span className="text-xs font-black bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded border border-rose-500/30">
                              MYTH
                            </span>
                            {item.myth}
                          </span>
                          <ChevronDown
                            className={`w-5 h-5 text-slate-400 transition-transform ${
                              isOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        {isOpen && (
                          <div className="p-4 bg-slate-950/60 border-t border-slate-800 text-xs text-slate-300 space-y-1 animate-in fade-in duration-150">
                            <span className="font-extrabold text-emerald-400 uppercase tracking-wider block mb-1">
                              FACT
                            </span>
                            <p className="leading-relaxed font-medium">
                              {item.fact}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 4: JUDGES PANEL */}
            {activeTab === "judges" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-700 pb-4 gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <Award className="text-emerald-400" /> Official Judge
                      Analytics Panel
                    </h2>
                    <p className="text-xs text-slate-400">
                      Manage difficulty, review student data, and analyze test
                      performance.
                    </p>
                  </div>

                  <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-700 gap-1">
                    <button
                      onClick={() => setJudgeSubTab("table")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                        judgeSubTab === "table"
                          ? "bg-emerald-500 text-slate-950"
                          : "text-slate-400"
                      }`}
                    >
                      <ClipboardList className="w-3.5 h-3.5" /> Table
                    </button>
                    <button
                      onClick={() => setJudgeSubTab("barchart")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                        judgeSubTab === "barchart"
                          ? "bg-emerald-500 text-slate-950"
                          : "text-slate-400"
                      }`}
                    >
                      <BarChart3 className="w-3.5 h-3.5" /> Bar Chart
                    </button>
                    <button
                      onClick={() => setJudgeSubTab("piechart")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                        judgeSubTab === "piechart"
                          ? "bg-emerald-500 text-slate-950"
                          : "text-slate-400"
                      }`}
                    >
                      <PieChart className="w-3.5 h-3.5" /> Pie Chart
                    </button>
                  </div>
                </div>

                <div className="bg-slate-900/90 border border-slate-700 p-5 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sliders className="w-5 h-5 text-emerald-400" />
                      <h3 className="text-sm font-bold text-white">
                        Live CPR Speed Benchmark Difficulty
                      </h3>
                    </div>
                    <span className="text-emerald-400 font-black text-sm bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/30">
                      {targetBpm} BPM
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Adjust target tempo live for student evaluations (AHA
                    standard is 100-120 BPM).
                  </p>
                  <input
                    type="range"
                    min="100"
                    max="120"
                    step="1"
                    value={targetBpm}
                    onChange={(e) => setTargetBpm(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer bg-slate-800 rounded-lg h-2"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                    <span>100 BPM (Slower)</span>
                    <span>110 BPM (Standard)</span>
                    <span>120 BPM (Fast)</span>
                  </div>
                </div>

                {judgeSubTab === "table" && (
                  <div className="space-y-4">
                    <div className="flex justify-end">
                      {judgeRecords.length > 0 && (
                        <button
                          onClick={() => {
                            if (window.confirm("Clear all judge records?")) {
                              setJudgeRecords([]);
                              localStorage.removeItem("cpr_judge_records");
                            }
                          }}
                          className="text-xs bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Clear All Data
                        </button>
                      )}
                    </div>

                    {judgeRecords.length === 0 ? (
                      <div className="text-center py-16 space-y-3 bg-slate-900/40 rounded-xl border border-slate-700">
                        <ClipboardList className="w-12 h-12 text-slate-600 mx-auto" />
                        <p className="text-slate-400 font-semibold">
                          No student records saved yet.
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-300">
                          <thead className="bg-slate-900 text-xs uppercase font-extrabold text-slate-400">
                            <tr>
                              <th className="p-3 rounded-l-lg">Student Name</th>
                              <th className="p-3">Status</th>
                              <th className="p-3">Score</th>
                              <th className="p-3">Pace</th>
                              <th className="p-3">Pages Visited</th>
                              <th className="p-3 text-right rounded-r-lg">
                                Details
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-700/50">
                            {judgeRecords.map((rec) => (
                              <tr
                                key={rec.id}
                                onClick={() => setSelectedStudentCard(rec)}
                                className="hover:bg-slate-700/40 cursor-pointer transition-colors group"
                              >
                                <td className="p-3 font-bold text-white group-hover:text-emerald-400 transition-colors">
                                  {rec.name}
                                </td>
                                <td className="p-3">
                                  {rec.passed ? (
                                    <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-500/20">
                                      <CheckCircle2 className="w-3.5 h-3.5" />{" "}
                                      PASSED
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 bg-rose-500/10 text-rose-400 text-xs font-bold px-2.5 py-1 rounded-full border border-rose-500/20">
                                      <XCircle className="w-3.5 h-3.5" /> FAILED
                                    </span>
                                  )}
                                </td>
                                <td className="p-3 font-extrabold text-white">
                                  {rec.score}%
                                </td>
                                <td className="p-3 font-bold text-emerald-400">
                                  {rec.actualBPM} BPM
                                </td>
                                <td className="p-3 text-xs text-slate-400">
                                  {rec.pagesVisited
                                    ? rec.pagesVisited.join(", ")
                                    : "simulator"}
                                </td>
                                <td className="p-3 text-right">
                                  <button className="bg-slate-700 hover:bg-emerald-500 hover:text-slate-950 text-slate-200 p-1.5 rounded-lg transition-colors">
                                    <Eye className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {judgeSubTab === "barchart" && (
                  <div className="space-y-6">
                    <h3 className="text-md font-bold text-white">
                      Student BPM Performance vs. Target Pace ({targetBpm} BPM)
                    </h3>
                    {judgeRecords.length === 0 ? (
                      <p className="text-xs text-slate-500 text-center py-12">
                        No data available for bar chart.
                      </p>
                    ) : (
                      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-700 space-y-4">
                        <div className="space-y-4">
                          {judgeRecords.map((rec) => {
                            const bpmPct = Math.min(
                              Math.round((rec.actualBPM / 150) * 100),
                              100
                            );
                            return (
                              <div key={rec.id} className="space-y-1">
                                <div className="flex justify-between text-xs font-bold">
                                  <span className="text-slate-200">
                                    {rec.name}
                                  </span>
                                  <span
                                    className={
                                      rec.passed
                                        ? "text-emerald-400"
                                        : "text-rose-400"
                                    }
                                  >
                                    {rec.actualBPM} BPM ({rec.score}%)
                                  </span>
                                </div>
                                <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden relative">
                                  <div
                                    className={`h-full transition-all ${
                                      rec.passed
                                        ? "bg-emerald-500"
                                        : "bg-rose-500"
                                    }`}
                                    style={{ width: `${bpmPct}%` }}
                                  ></div>
                                  <div
                                    className="absolute top-0 bottom-0 w-0.5 bg-yellow-400 shadow"
                                    style={{
                                      left: `${(targetBpm / 150) * 100}%`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {judgeSubTab === "piechart" && (
                  <div className="space-y-6 text-center">
                    <h3 className="text-md font-bold text-white">
                      Overall Student Pass vs. Fail Rate
                    </h3>
                    {totalAttempts === 0 ? (
                      <p className="text-xs text-slate-500 py-12">
                        No data available for pie chart.
                      </p>
                    ) : (
                      <div className="bg-slate-900 p-8 rounded-2xl border border-slate-700 max-w-md mx-auto flex flex-col items-center space-y-6">
                        <div className="relative w-48 h-48">
                          <svg
                            className="w-full h-full transform -rotate-90"
                            viewBox="0 0 36 36"
                          >
                            <path
                              className="text-slate-800"
                              strokeWidth="4"
                              stroke="currentColor"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path
                              className="text-emerald-500"
                              strokeDasharray={`${passRatePercentage}, 100`}
                              strokeWidth="4"
                              strokeLinecap="round"
                              stroke="currentColor"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-black text-white">
                              {passRatePercentage}%
                            </span>
                            <span className="text-xs text-slate-400 uppercase font-bold">
                              Pass Rate
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 w-full">
                          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                            <span className="text-xs text-slate-400 font-bold block">
                              PASSED
                            </span>
                            <span className="text-xl font-black text-emerald-400">
                              {passCount} ({passRatePercentage}%)
                            </span>
                          </div>
                          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                            <span className="text-xs text-slate-400 font-bold block">
                              FAILED
                            </span>
                            <span className="text-xl font-black text-rose-400">
                              {failCount} ({failRatePercentage}%)
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* AED VISUAL GUIDE ANIMATION MODAL */}
        {showAedGuideModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border-2 border-blue-500/50 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6 relative animate-in fade-in zoom-in duration-200">
              <button
                onClick={() => setShowAedGuideModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <div className="w-12 h-12 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">
                    Interactive AED Pad Guide
                  </h3>
                  <p className="text-xs text-slate-400">
                    Exact pad placement for adult vs pediatric emergency cases
                  </p>
                </div>
              </div>

              {/* Body Type Selector */}
              <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                <button
                  onClick={() => setPadBodyType("adult")}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    padBodyType === "adult"
                      ? "bg-blue-600 text-white shadow"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Adult Placement (8+ Years)
                </button>
                <button
                  onClick={() => setPadBodyType("pediatric")}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    padBodyType === "pediatric"
                      ? "bg-blue-600 text-white shadow"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Pediatric Placement (&lt;8 Years)
                </button>
              </div>

              {/* Graphical Animation SVG / Layout */}
              <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 flex flex-col items-center justify-center relative min-h-[220px]">
                <svg className="w-40 h-48" viewBox="0 0 100 130">
                  <path
                    d="M35 15 C35 5, 65 5, 65 15 L75 35 C85 45, 80 80, 75 110 L25 110 C20 80, 15 45, 25 35 Z"
                    fill="#1e293b"
                    stroke="#475569"
                    strokeWidth="2"
                  />
                  {padBodyType === "adult" ? (
                    <>
                      <rect
                        x="55"
                        y="35"
                        width="24"
                        height="28"
                        rx="4"
                        className="fill-blue-500 animate-pulse"
                        stroke="#93c5fd"
                        strokeWidth="1.5"
                      />
                      <text
                        x="67"
                        y="52"
                        fill="#fff"
                        fontSize="8"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        PAD 1
                      </text>
                      <rect
                        x="20"
                        y="70"
                        width="24"
                        height="28"
                        rx="4"
                        className="fill-blue-500 animate-pulse"
                        stroke="#93c5fd"
                        strokeWidth="1.5"
                      />
                      <text
                        x="32"
                        y="87"
                        fill="#fff"
                        fontSize="8"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        PAD 2
                      </text>
                    </>
                  ) : (
                    <>
                      <rect
                        x="38"
                        y="45"
                        width="24"
                        height="24"
                        rx="4"
                        className="fill-amber-500 animate-pulse"
                        stroke="#fde047"
                        strokeWidth="1.5"
                      />
                      <text
                        x="50"
                        y="60"
                        fill="#000"
                        fontSize="7"
                        fontWeight="black"
                        textAnchor="middle"
                      >
                        FRONT
                      </text>
                      <rect
                        x="38"
                        y="78"
                        width="24"
                        height="24"
                        rx="4"
                        className="fill-amber-600 animate-pulse"
                        stroke="#fde047"
                        strokeWidth="1.5"
                      />
                      <text
                        x="50"
                        y="93"
                        fill="#fff"
                        fontSize="7"
                        fontWeight="black"
                        textAnchor="middle"
                      >
                        BACK
                      </text>
                    </>
                  )}
                </svg>

                <p className="text-xs text-slate-300 text-center mt-3 font-semibold">
                  {padBodyType === "adult"
                    ? "Place Pad 1 on upper right chest below collarbone. Place Pad 2 on lower left side below armpit."
                    : "Place one pad directly in the center of the chest and the other pad on the center of the back between shoulder blades."}
                </p>
              </div>

              <button
                onClick={() => setShowAedGuideModal(false)}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl transition-all text-xs"
              >
                Close Guide
              </button>
            </div>
          </div>
        )}

        {/* CLICKABLE POP-UP STUDENT CARD MODAL */}
        {selectedStudentCard && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border-2 border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6 relative animate-in fade-in zoom-in duration-200">
              <button
                onClick={() => setSelectedStudentCard(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl flex items-center justify-center font-bold text-xl">
                  {selectedStudentCard.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">
                    {selectedStudentCard.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Tested at {selectedStudentCard.timestamp}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                  <span className="text-xs text-slate-400 font-bold block">
                    CPR STATUS
                  </span>
                  <span
                    className={`text-lg font-black ${
                      selectedStudentCard.passed
                        ? "text-emerald-400"
                        : "text-rose-400"
                    }`}
                  >
                    {selectedStudentCard.passed ? "PASSED" : "FAILED"} (
                    {selectedStudentCard.score}%)
                  </span>
                </div>
                <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                  <span className="text-xs text-slate-400 font-bold block">
                    PRACTICED BPM
                  </span>
                  <span className="text-lg font-black text-emerald-400">
                    {selectedStudentCard.actualBPM} BPM
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 text-emerald-400" /> Modules &
                  Pages Visited
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedStudentCard.pagesVisited ? (
                    selectedStudentCard.pagesVisited.map((page, index) => (
                      <span
                        key={index}
                        className="bg-slate-800 text-slate-200 text-xs font-semibold px-3 py-1 rounded-lg border border-slate-700 capitalize"
                      >
                        {page === "student"
                          ? "CPR Simulator"
                          : page === "quiz"
                          ? "CPR Quiz"
                          : page}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500">
                      CPR Simulator
                    </span>
                  )}
                </div>
              </div>

              {selectedStudentCard.survey ? (
                <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-2">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Survey Response Data
                  </h4>
                  <div className="space-y-1 text-xs text-slate-400">
                    <p>
                      <span className="text-white font-semibold">
                        Confidence:
                      </span>{" "}
                      {selectedStudentCard.survey.confidence}
                    </p>
                    <p>
                      <span className="text-white font-semibold">
                        Rate Knowledge:
                      </span>{" "}
                      {selectedStudentCard.survey.knowledge}
                    </p>
                    <p>
                      <span className="text-white font-semibold">
                        Main Concern:
                      </span>{" "}
                      {selectedStudentCard.survey.hesitation}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">
                  Has not taken the CPR Confidence Quiz yet.
                </p>
              )}

              <button
                onClick={() => setSelectedStudentCard(null)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-xl transition-all text-xs"
              >
                Close Student Card
              </button>
            </div>
          </div>
        )}

        {/* JUDGES LOGIN MODAL */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center mx-auto text-emerald-400 mb-2">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">
                  Judges Authentication
                </h3>
                <p className="text-xs text-slate-400">
                  Enter admin password to view judge panel
                </p>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-3">
                <input
                  type="password"
                  required
                  autoFocus
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setPasswordError(false);
                  }}
                  placeholder="Enter Admin Password"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-center text-sm focus:outline-none focus:border-emerald-500"
                />

                {passwordError && (
                  <p className="text-xs text-rose-400 text-center font-semibold">
                    Incorrect password. Try again.
                  </p>
                )}

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordModal(false);
                      setPasswordError(false);
                      setPasswordInput("");
                    }}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl"
                  >
                    Login
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* FINISH RESULT CARD MODAL */}
        {showResultCard && latestResult && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border-2 border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-6 relative animate-in fade-in zoom-in duration-200">
              <div className="text-center space-y-2">
                {latestResult.passed ? (
                  <div className="w-16 h-16 bg-emerald-500/10 border-2 border-emerald-500 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-rose-500/10 border-2 border-rose-500 rounded-full flex items-center justify-center mx-auto text-rose-400">
                    <XCircle className="w-10 h-10" />
                  </div>
                )}

                <h3
                  className={`text-3xl font-black ${
                    latestResult.passed ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {latestResult.passed ? "TEST PASSED!" : "TEST FAILED"}
                </h3>
                <p className="text-sm text-slate-300 font-semibold">
                  {latestResult.name}
                </p>
              </div>

              <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-3">
                <div className="flex justify-between items-center border-b border-slate-700 pb-2">
                  <span className="text-xs text-slate-400 font-bold uppercase">
                    Timing Precision Score
                  </span>
                  <span className="text-xl font-extrabold text-white">
                    {latestResult.score}%
                  </span>
                </div>

                <div className="flex justify-between items-center border-b border-slate-700 pb-2">
                  <span className="text-xs text-slate-400 font-bold uppercase">
                    Student Beat
                  </span>
                  <span className="text-lg font-black text-emerald-400">
                    {latestResult.actualBPM} BPM
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400 font-bold uppercase">
                    Compressions
                  </span>
                  <span className="text-sm font-bold text-white">
                    {latestResult.totalCompressions} / 30
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowResultCard(false)}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold py-3 rounded-xl transition-all"
              >
                Close & Continue
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

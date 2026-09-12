import React, { useState } from 'react';
import {
  X,
  RefreshCw,
  Download,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  Sliders,
  ChevronDown,
  ChevronUp,
  Cpu,
  Radio,
  Check
} from 'lucide-react';
import { useSocial } from '../context/SocialContext';

export const SoftwareUpdateModal: React.FC = () => {
  const {
    isSoftwareUpdateOpen,
    setIsSoftwareUpdateOpen,
    softwareInfo,
    updateStatus,
    updateProgress,
    checkForUpdates,
    applySoftwareUpdate,
    toggleAutoUpdate,
    setUpdateChannel,
    rollbackSoftwareVersion,
  } = useSocial();

  const [expandedChangelog, setExpandedChangelog] = useState<string>('2.5.0');
  const [showAdvanced, setShowAdvanced] = useState(false);

  if (!isSoftwareUpdateOpen) return null;

  const isUpdating = updateStatus === 'downloading';
  const isChecking = updateStatus === 'checking';
  const isUpToDate = !softwareInfo.hasUpdate && updateStatus !== 'available';

  return (
    <div
      id="modal-software-update"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isUpdating) {
          setIsSoftwareUpdateOpen(false);
        }
      }}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-900 text-white flex items-center justify-center shadow-xs">
              <Cpu className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 leading-tight">Software Update</h2>
              <p className="text-xs text-zinc-500">Wavelink System & Model Manager</p>
            </div>
          </div>

          <button
            id="btn-close-software-update"
            onClick={() => !isUpdating && setIsSoftwareUpdateOpen(false)}
            disabled={isUpdating}
            className="p-1.5 rounded-full hover:bg-zinc-200 text-zinc-400 hover:text-zinc-700 transition-colors disabled:opacity-40"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Main Status Hero Card */}
          <div
            className={`rounded-2xl p-5 border transition-all ${
              softwareInfo.hasUpdate
                ? 'bg-gradient-to-br from-indigo-50/90 via-white to-violet-50/70 border-indigo-200 shadow-xs'
                : 'bg-gradient-to-br from-emerald-50/60 via-white to-teal-50/50 border-emerald-200/80 shadow-xs'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                    softwareInfo.hasUpdate
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                      : 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                  }`}
                >
                  {isChecking ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : softwareInfo.hasUpdate ? (
                    <Download className="w-5 h-5" />
                  ) : (
                    <ShieldCheck className="w-5 h-5" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      Current Version
                    </span>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-zinc-200/70 text-zinc-800">
                      v{softwareInfo.currentVersion}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-zinc-900 mt-0.5">
                    {isChecking
                      ? 'Checking for updates...'
                      : isUpdating
                      ? `Installing Wavelink v${softwareInfo.latestVersion}`
                      : softwareInfo.hasUpdate
                      ? `Wavelink v${softwareInfo.latestVersion} Available`
                      : 'Wavelink is Up to Date'}
                  </h3>
                </div>
              </div>

              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                  softwareInfo.channel === 'beta'
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : 'bg-zinc-100 text-zinc-700 border border-zinc-200'
                }`}
              >
                {softwareInfo.channel}
              </span>
            </div>

            {/* Description / Progress Bar */}
            {isUpdating ? (
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-xs font-medium text-zinc-600">
                  <span>Downloading package & updating AI pipelines...</span>
                  <span className="font-mono font-bold text-indigo-600">{updateProgress}%</span>
                </div>
                <div className="w-full h-2.5 bg-zinc-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                    style={{ width: `${updateProgress}%` }}
                  />
                </div>
                <p className="text-[11px] text-zinc-400">
                  Verifying integrity, updating Gemini WebSocket protocols & caching assets...
                </p>
              </div>
            ) : (
              <p className="text-xs text-zinc-600 mt-2.5 leading-relaxed">
                {softwareInfo.hasUpdate
                  ? `An update with the new Gemini 3.1 Flash Live voice model, Gemini 3.5 Transcribe engine, and interface performance upgrades is ready to install (${
                      softwareInfo.changelog[0]?.size || '4.8 MB'
                    }).`
                  : `Your system is running the latest stable build (${softwareInfo.build}). All AI tools and social features are operating at peak efficiency.`}
              </p>
            )}

            {/* Action Buttons */}
            <div className="mt-4 pt-3 border-t border-zinc-200/60 flex flex-wrap items-center justify-between gap-2">
              <div className="text-[11px] text-zinc-400">
                Last checked: <span className="text-zinc-600 font-medium">{softwareInfo.lastChecked}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  id="btn-check-updates-modal"
                  onClick={() => checkForUpdates()}
                  disabled={isChecking || isUpdating}
                  className="px-3 py-1.5 rounded-xl border border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-700 font-semibold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin text-indigo-600' : ''}`} />
                  <span>{isChecking ? 'Checking...' : 'Check for Updates'}</span>
                </button>

                {softwareInfo.hasUpdate && (
                  <button
                    id="btn-apply-update-modal"
                    onClick={() => applySoftwareUpdate()}
                    disabled={isUpdating}
                    className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Update Now (v{softwareInfo.latestVersion})</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Preferences & Channel Settings */}
          <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-zinc-600" />
                <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                  Update Preferences
                </h4>
              </div>
            </div>

            {/* Automatic Updates Toggle */}
            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-xs font-bold text-zinc-800">Automatic Updates</p>
                <p className="text-[11px] text-zinc-500">
                  Automatically download and apply new versions in background
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={softwareInfo.autoUpdate}
                onClick={() => toggleAutoUpdate(!softwareInfo.autoUpdate)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                  softwareInfo.autoUpdate ? 'bg-zinc-900' : 'bg-zinc-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    softwareInfo.autoUpdate ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Release Channel Selector */}
            <div className="pt-2 border-t border-zinc-200/60 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-zinc-800">Release Channel</p>
                <p className="text-[11px] text-zinc-500">
                  Select between tested stable releases or upcoming preview features
                </p>
              </div>

              <div className="flex items-center bg-zinc-200/70 p-0.5 rounded-lg text-xs font-semibold">
                <button
                  onClick={() => setUpdateChannel('stable')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    softwareInfo.channel === 'stable'
                      ? 'bg-white text-zinc-900 shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  Stable
                </button>
                <button
                  onClick={() => setUpdateChannel('beta')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    softwareInfo.channel === 'beta'
                      ? 'bg-white text-zinc-900 shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  Beta
                </button>
              </div>
            </div>
          </div>

          {/* Release Notes / What's New Accordion */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                  What's New in Wavelink
                </h4>
              </div>
              <span className="text-[11px] text-zinc-400">Release Notes</span>
            </div>

            <div className="space-y-2">
              {softwareInfo.changelog.map((log) => {
                const isExpanded = expandedChangelog === log.version;
                const isCurrent = log.version === softwareInfo.currentVersion;
                return (
                  <div
                    key={log.version}
                    className="border border-zinc-200/90 rounded-xl overflow-hidden bg-white"
                  >
                    <button
                      onClick={() =>
                        setExpandedChangelog(isExpanded ? '' : log.version)
                      }
                      className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-zinc-50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-zinc-900">
                          v{log.version}
                        </span>
                        <span className="text-xs text-zinc-600 font-medium">
                          {log.title}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] font-bold bg-zinc-100 text-zinc-600 px-1.5 py-0.2 rounded border border-zinc-200">
                            Current
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-zinc-400">
                        <span className="text-[11px]">{log.date}</span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-3.5 pt-1 border-t border-zinc-100 bg-zinc-50/50">
                        <ul className="space-y-1.5">
                          {log.highlights.map((item, idx) => (
                            <li
                              key={idx}
                              className="text-xs text-zinc-600 flex items-start gap-2 leading-relaxed"
                            >
                              <span className="text-indigo-600 font-bold mt-0.5">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Advanced / Developer Options Toggle */}
          <div className="pt-2 border-t border-zinc-100">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-[11px] text-zinc-400 hover:text-zinc-600 font-medium flex items-center gap-1"
            >
              <span>{showAdvanced ? 'Hide testing options' : 'Testing / Verification tools'}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${
                  showAdvanced ? 'rotate-180' : ''
                }`}
              />
            </button>

            {showAdvanced && (
              <div className="mt-2 p-3 bg-zinc-50 rounded-xl border border-dashed border-zinc-200 text-xs space-y-2">
                <p className="text-[11px] text-zinc-500">
                  Simulate different software update scenarios for testing:
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => rollbackSoftwareVersion('2.4.2')}
                    className="px-2.5 py-1 bg-white border border-zinc-300 rounded-lg text-[11px] font-semibold text-zinc-700 hover:bg-zinc-100 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset to v2.4.2 (Shows Available Update)
                  </button>
                  <button
                    onClick={() => rollbackSoftwareVersion('2.5.0')}
                    className="px-2.5 py-1 bg-white border border-zinc-300 rounded-lg text-[11px] font-semibold text-zinc-700 hover:bg-zinc-100 flex items-center gap-1"
                  >
                    <Check className="w-3 h-3 text-emerald-600" />
                    Set to v2.5.0 (Shows Up to Date)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <span>Build:</span>
            <span className="text-zinc-700 font-semibold">{softwareInfo.build}</span>
          </div>

          <button
            onClick={() => setIsSoftwareUpdateOpen(false)}
            disabled={isUpdating}
            className="px-4 py-1.5 rounded-xl bg-zinc-200 hover:bg-zinc-300 text-zinc-800 font-semibold text-xs transition-colors disabled:opacity-50"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

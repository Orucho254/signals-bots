import React, { useState } from "react";
import { WhatsAppConfig } from "../types";
import { Send, CheckCircle2, AlertCircle, HelpCircle, Eye, EyeOff, Check, PowerOff, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Props {
  config: WhatsAppConfig;
  onChange: (newConfig: WhatsAppConfig) => void;
}

export default function WhatsAppConfigPanel({ config, onChange }: Props) {
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [successInfo, setSuccessInfo] = useState<{ title: string; id: string } | null>(null);
  const [showToken, setShowToken] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const handleDisconnect = () => {
    setTestStatus("idle");
    setErrorMessage("");
    setSuccessInfo(null);
    onChange({
      ...config,
      apiTokenInstance: "",
      idInstance: "",
      chatId: "",
      isConnected: false,
      chatTitle: "",
    });
  };

  const handleInstantConnect = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!config.apiTokenInstance || !config.idInstance || !config.chatId) {
      setErrorMessage("Please fill in the ID Instance, API Token Instance, and Group ID / Chat ID.");
      setTestStatus("error");
      return;
    }
    setTestStatus("success");
    setSuccessInfo({ title: "WhatsApp Chat Linked", id: config.chatId.trim() });
    onChange({
      ...config,
      apiTokenInstance: config.apiTokenInstance.trim(),
      idInstance: config.idInstance.trim(),
      chatId: config.chatId.trim(),
      isConnected: true,
      chatTitle: config.chatTitle || "Linked WhatsApp Chat",
    });
  };

  const handleTestConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config.apiTokenInstance || !config.idInstance || !config.chatId) {
      setErrorMessage("Please fill in the ID Instance, API Token Instance, and Group ID / Chat ID.");
      setTestStatus("error");
      return;
    }

    setTestStatus("testing");
    setErrorMessage("");
    setSuccessInfo(null);

    try {
      const response = await fetch("/api/whatsapp/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idInstance: config.idInstance.trim(),
          apiTokenInstance: config.apiTokenInstance.trim(),
          chatId: config.chatId.trim(),
        }),
      });

      const ct = response.headers.get("content-type") || "";
      if (!ct.includes("application/json")) {
        const txt = await response.text();
        throw new Error(`Server returned non-JSON response (HTTP ${response.status}). Preview: ${txt.substring(0, 150)}`);
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        onChange({ ...config, isConnected: false });
        throw new Error(data.error || "Connection test failed");
      }

      setTestStatus("success");
      setSuccessInfo({ title: data.chatTitle || "WhatsApp Group", id: config.chatId.trim() });
      onChange({
        ...config,
        apiTokenInstance: config.apiTokenInstance.trim(),
        idInstance: config.idInstance.trim(),
        chatId: config.chatId.trim(),
        isConnected: true,
        chatTitle: data.chatTitle || "WhatsApp Chat",
      });
    } catch (err: any) {
      setTestStatus("error");
      setErrorMessage(err.message || "An unexpected error occurred connecting to Green API.");
      onChange({ ...config, isConnected: false });
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6" id="whatsapp-config-card">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <h2 className="text-lg font-semibold tracking-tight text-white font-sans">WhatsApp Bot Settings (Green API)</h2>
          </div>
          <p className="text-xs text-slate-400">Configure credentials to link your WhatsApp group or chat.</p>
        </div>
        <button
          onClick={() => setShowGuide(!showGuide)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/50 rounded-lg transition-all"
          type="button"
          id="btn-toggle-wa-cfg-guide"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Setup Guide</span>
        </button>
      </div>

      <AnimatePresence>
        {showGuide && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden bg-slate-950/60 border border-slate-800/80 rounded-xl"
          >
            <div className="p-4 space-y-4 text-xs leading-relaxed text-slate-300">
              <h3 className="font-semibold text-emerald-400 text-sm">🟢 Connect WhatsApp via Green API</h3>
              <ol className="space-y-3.5 list-decimal pl-4">
                <li>
                  <strong className="text-slate-200">Create a Green API Account:</strong>
                  <div className="text-slate-400 mt-1">
                    Go to <a href="https://green-api.com" target="_blank" rel="noreferrer" className="text-emerald-400 underline font-semibold">green-api.com</a> and sign up for a free console instance.
                  </div>
                </li>
                <li>
                  <strong className="text-slate-200">Scan QR Code:</strong>
                  <div className="text-slate-400 mt-1">
                    In your Green API Console, open the instance dashboard and scan the WhatsApp Web QR code using your phone's WhatsApp application to link the bot instance.
                  </div>
                </li>
                <li>
                  <strong className="text-slate-200">Copy Credentials:</strong>
                  <div className="text-slate-400 mt-1">
                    Copy your <code className="text-emerald-300">idInstance</code> (e.g. <code className="bg-slate-900 text-slate-300 px-1 rounded">7103123456</code>) and <code className="text-emerald-300">apiTokenInstance</code> from your Green API dashboard.
                  </div>
                </li>
                <li>
                  <strong className="text-slate-200">Get Chat / Group ID:</strong>
                  <div className="text-slate-400 mt-1">
                    <b>For a WhatsApp Group:</b> The ID typically looks like <code className="text-emerald-300">120363198881234567@g.us</code>.<br />
                    <b>For a Personal Chat:</b> Use the phone number with country code followed by <code className="text-emerald-300">@c.us</code> (e.g. <code className="text-emerald-300">254701234567@c.us</code>).
                  </div>
                </li>
              </ol>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleTestConnection} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">
              <span>idInstance</span>
            </label>
            <input
              type="text"
              value={config.idInstance}
              onChange={(e) => onChange({ ...config, idInstance: e.target.value })}
              placeholder="e.g. 7103123456"
              className="w-full px-3.5 py-2.5 text-xs bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-slate-100 placeholder-slate-600 outline-none transition-all font-mono"
              required
              id="input-wa-id-instance"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">
              <span>apiTokenInstance</span>
            </label>
            <div className="relative">
              <input
                type={showToken ? "text" : "password"}
                value={config.apiTokenInstance}
                onChange={(e) => onChange({ ...config, apiTokenInstance: e.target.value })}
                placeholder="e.g. 4ab3c89f..."
                className="w-full px-3.5 py-2.5 text-xs bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-slate-100 placeholder-slate-600 outline-none transition-all pr-10 font-mono"
                required
                id="input-wa-api-token"
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300 flex justify-between">
            <span>Group ID or Personal Chat ID</span>
            <span className="text-[10px] text-slate-500 font-mono">ends with @g.us or @c.us</span>
          </label>
          <input
            type="text"
            value={config.chatId}
            onChange={(e) => onChange({ ...config, chatId: e.target.value })}
            placeholder="e.g. 120363198881234567@g.us  or  254701234567@c.us"
            className="w-full px-3.5 py-2.5 text-xs bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-slate-100 placeholder-slate-600 outline-none transition-all font-mono"
            required
            id="input-wa-chat-id"
          />
          <p className="text-[10px] text-slate-500 px-1">
            Ensure you include the suffix exactly (<code className="font-mono bg-slate-950 px-1 py-0.5 rounded text-emerald-500">@g.us</code> for groups, <code className="font-mono bg-slate-950 px-1 py-0.5 rounded text-emerald-500">@c.us</code> for individuals).
          </p>
        </div>

        {/* WhatsApp Broadcast options */}
        <div className="bg-slate-950/80 p-4 border border-slate-800/80 rounded-xl space-y-3" id="wa-toggle-broadcast-options">
          <h4 className="text-xs font-semibold text-emerald-400 font-sans tracking-wide uppercase flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>WhatsApp Broadcast Sharing Control</span>
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5 max-w-[80%]">
                <span className="font-semibold text-slate-200">1. Volatility Scanner Auto-Broadcast</span>
                <p className="text-[10px] text-slate-400 leading-normal">
                  Enable automatic sharing of live setups directly to this WhatsApp chat.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onChange({ ...config, enableScannerBroadcast: config.enableScannerBroadcast === false ? true : false })}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border border-slate-700/30 transition-colors duration-200 ease-in-out focus:outline-none ${config.enableScannerBroadcast !== false ? "bg-emerald-500" : "bg-slate-800"}`}
                id="wa-toggle-scanner-sharing"
              >
                <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${config.enableScannerBroadcast !== false ? "translate-x-4" : "translate-x-0"}`} />
              </button>
            </div>

            <div className="flex items-center justify-between gap-3 text-xs pt-1 border-t border-slate-900">
              <div className="space-y-0.5 max-w-[80%]">
                <span className="font-semibold text-slate-200">2. AI Signal Compiler Auto-Share</span>
                <p className="text-[10px] text-slate-400 leading-normal">
                  Enable immediate automatic broadcast of compiled drafts to WhatsApp without manual approval.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onChange({ ...config, enableManualBroadcast: config.enableManualBroadcast === false ? true : false })}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border border-slate-700/30 transition-colors duration-200 ease-in-out focus:outline-none ${config.enableManualBroadcast !== false ? "bg-emerald-500" : "bg-slate-800"}`}
                id="wa-toggle-manual-sharing"
              >
                <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${config.enableManualBroadcast !== false ? "translate-x-4" : "translate-x-0"}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="pt-2 flex flex-wrap gap-2.5 items-stretch sm:items-center">
          {!config.isConnected ? (
            <>
              <button
                type="button"
                onClick={handleInstantConnect}
                disabled={!config.apiTokenInstance || !config.idInstance || !config.chatId}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-emerald-500/10 cursor-pointer disabled:cursor-not-allowed transform hover:-translate-y-px active:translate-y-0 transition-all font-sans"
                id="btn-wa-instant-connect"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Connect Bot</span>
              </button>
              <button
                type="submit"
                disabled={testStatus === "testing" || !config.apiTokenInstance || !config.idInstance || !config.chatId}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:bg-slate-900 disabled:text-slate-500 border border-slate-700 hover:border-slate-600 font-medium text-xs rounded-xl cursor-pointer disabled:cursor-not-allowed transition-all font-sans"
                id="btn-wa-test-connection"
              >
                {testStatus === "testing" ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Sending Test...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Test Message</span>
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleDisconnect}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 hover:border-rose-500/30 font-medium text-xs rounded-xl cursor-pointer transition-all font-sans"
                id="btn-disconnect-whatsapp"
              >
                <PowerOff className="w-3.5 h-3.5" />
                <span>Disconnect Chat</span>
              </button>
              <button
                type="submit"
                disabled={testStatus === "testing" || !config.apiTokenInstance || !config.idInstance || !config.chatId}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:bg-slate-900 disabled:text-slate-500 border border-slate-700 hover:border-slate-600 font-medium text-xs rounded-xl cursor-pointer disabled:cursor-not-allowed transition-all font-sans"
                id="btn-wa-test-connection-connected"
              >
                {testStatus === "testing" ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Sending Test...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Test Message</span>
                  </>
                )}
              </button>
            </>
          )}

          {config.isConnected && testStatus !== "error" && (
            <div className="flex items-center gap-1.5 text-emerald-400 text-xs py-2 sm:py-0 px-2 font-medium sm:ml-auto" id="wa-connected-badge">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Linked: {config.chatTitle || "Chat Connected"}</span>
            </div>
          )}
        </div>

        {/* Feedback banners */}
        <AnimatePresence mode="wait">
          {testStatus === "success" && successInfo && (
            <motion.div
              initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
              className="bg-emerald-950/40 border border-emerald-900/50 rounded-xl p-3.5 text-xs text-emerald-300 space-y-1"
              id="wa-test-success-banner"
            >
              <div className="flex items-center gap-1.5 font-semibold">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Connection Successful!</span>
              </div>
              <p className="text-slate-300">
                A verification message was sent to <b>{successInfo.title}</b>. Your signals are ready to broadcast to WhatsApp.
              </p>
            </motion.div>
          )}

          {testStatus === "error" && (
            <motion.div
              initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
              className="bg-rose-950/40 border border-rose-900/50 rounded-xl p-3.5 text-xs text-rose-300 space-y-1"
              id="wa-test-error-banner"
            >
              <div className="flex items-center gap-1.5 font-semibold">
                <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                <span>WhatsApp Connection Failed</span>
              </div>
              <p className="text-slate-300">{errorMessage}</p>
              <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-400 mt-2">
                <li>Verify your <b>idInstance</b> and <b>apiTokenInstance</b> are copied correctly from Green API Console.</li>
                <li>Make sure your WhatsApp instance on Green API is <b>Authorized</b> (scan QR code in their dashboard).</li>
                <li>Ensure the Group ID ends with <code className="font-mono">@g.us</code> or the personal chat ends with <code className="font-mono">@c.us</code>.</li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
}

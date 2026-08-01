"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { ShieldCheck, KeyRound, Sparkles, RefreshCw } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function getCookie(name: string): string {
  if (typeof document === "undefined") return "";
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || "";
  return "";
}

function setCookie(name: string, value: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${value}; path=/; max-age=31536000; SameSite=Strict`;
}

function deleteCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Strict`;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [provider, setProvider] = useState<"default" | "gemini" | "groq" | "ollama">("default");
  const [apiKey, setApiKey] = useState("");
  const [modelName, setModelName] = useState("");
  const [saving, setSaving] = useState(false);

  // Load settings from cookies on open
  useEffect(() => {
    if (isOpen) {
      const savedProvider = (getCookie("custom_provider") || "default") as any;
      const savedApiKey = getCookie("custom_api_key") || "";
      const savedModel = getCookie("custom_model") || "";

      setProvider(savedProvider);
      setApiKey(savedApiKey);
      setModelName(savedModel);
    }
  }, [isOpen]);

  const handleSave = () => {
    setSaving(true);
    try {
      if (provider === "default") {
        deleteCookie("custom_provider");
        deleteCookie("custom_api_key");
        deleteCookie("custom_model");
      } else {
        setCookie("custom_provider", provider);
        setCookie("custom_api_key", apiKey.trim());
        setCookie("custom_model", modelName.trim());
      }

      setTimeout(() => {
        setSaving(false);
        onClose();
        // Reload to instantly refresh server-side context cookies
        window.location.reload();
      }, 500);
    } catch {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setProvider("default");
    setApiKey("");
    setModelName("");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="AI Engine Configuration"
      description="Choose your preferred model provider or bring your own API keys for custom learning parameters."
      maxWidth="md"
      loading={saving}
    >
      <div className="space-y-5.5 mt-4 text-left">
        {/* Model Provider */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2 select-none">
            AI Model Provider
          </label>
          <select
            value={provider}
            onChange={(e) => {
              const val = e.target.value as any;
              setProvider(val);
              if (val === "default") {
                setApiKey("");
                setModelName("");
              } else if (val === "gemini") {
                setModelName("gemini-1.5-flash");
              } else if (val === "groq") {
                setModelName("llama-3.3-70b-versatile");
              } else if (val === "ollama") {
                setModelName("gemma:2b");
              }
            }}
            className="w-full p-2.5 text-xs bg-muted/20 border border-border/80 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl outline-none text-foreground select-none cursor-pointer"
          >
            <option value="default">System Default (Shared Groq / Llama)</option>
            <option value="gemini">Google Gemini (Bring Your Own Key)</option>
            <option value="groq">Groq Console (Bring Your Own Key)</option>
            <option value="ollama">Local Ollama Server (Offline Dev)</option>
          </select>
        </div>

        {provider !== "default" && (
          <>
            {/* Custom API Key - Hide if Ollama */}
            {provider !== "ollama" && (
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2 select-none">
                  Custom API Key
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                    <KeyRound className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    placeholder={`Paste your custom ${provider === "gemini" ? "Gemini" : "Groq"} API key`}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 text-xs bg-muted/20 border border-border/80 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl outline-none text-foreground"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1.5 leading-normal">
                  * Stored locally in browser cookies for requests. Never shared or stored in our database.
                </p>
              </div>
            )}

            {/* Custom Model Name */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2 select-none">
                Model Identifier
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <Sparkles className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="e.g. gemini-1.5-pro, gemma2, llama3.1"
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-xs bg-muted/20 border border-border/80 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl outline-none text-foreground"
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1.5 leading-normal">
                {provider === "ollama"
                  ? "* Ensure the model is running locally on your device (`ollama run <model>`)."
                  : "* Ensure this model is supported by your API key's tier."}
              </p>
            </div>
          </>
        )}

        {/* Security / Safe notice */}
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-primary/5 border border-primary/10">
          <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <p className="text-[10px] text-muted-foreground leading-normal">
            <strong>Client Privacy Safe</strong>: By selecting Custom Keys, your requests bypass default system allocations completely. Your API tokens are secure and transmitted encrypted.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          {provider !== "default" && (
            <Button
              variant="danger"
              size="sm"
              onClick={handleReset}
              className="cursor-pointer"
            >
              Reset to default
            </Button>
          )}
          <div className="flex-1" />
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            loading={saving}
            className="cursor-pointer min-w-[70px]"
          >
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

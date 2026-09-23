import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Camera,
  Check,
  ChevronLeft,
  GalleryHorizontalEnd,
  MapPin,
  RefreshCcw,
  Send,
} from "lucide-react";
import { reportsApi } from "@/api/endpoints";
import { errorMessage } from "@/api/client";
import { toast } from "@/store/toastStore";
import { useGeolocation } from "@/hooks/useGeolocation";
import { Screen, Title, Subtitle, Button } from "@/components/ui";
import { MiniMap } from "@/components/MiniMap";

const WASTE_TYPES = [
  { value: "plastic", label: "Plastik", emoji: "🥤" },
  { value: "paper", label: "Qog'oz", emoji: "📄" },
  { value: "glass", label: "Shisha", emoji: "🍾" },
  { value: "household", label: "Maishiy chiqindi", emoji: "🗑️" },
  { value: "other", label: "Boshqa", emoji: "❓" },
];

type Step = 0 | 1 | 2 | 3;

export default function SubmitWaste() {
  const navigate = useNavigate();
  const geo = useGeolocation();

  const [step, setStep] = useState<Step>(0);
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [wasteType, setWasteType] = useState("other");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const galleryRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === 2 && !geo.lat && geo.state === "idle") geo.locate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const pick = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Faqat rasm tanlashingiz mumkin.");
      return;
    }
    setPhotoFile(file);
    setPhoto(URL.createObjectURL(file));
    setStep(1);
  };

  const retake = () => {
    setPhoto(null);
    setPhotoFile(null);
    setStep(0);
  };

  const submit = async () => {
    if (!photoFile || !geo.lat || !geo.lng) return;
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("image", photoFile);
      fd.append("latitude", String(geo.lat));
      fd.append("longitude", String(geo.lng));
      fd.append("accuracy_m", String(geo.accuracy ?? 0));
      fd.append("waste_type", wasteType);
      fd.append("description", description);
      const report = await reportsApi.create(fd);
      navigate("/submit/success", { state: { report }, replace: true });
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const steps = ["Surat", "Joylashuv", "Ma'lumot"];

  return (
    <Screen className="pb-8">
      <header className="flex items-center gap-3 pt-4 pb-5">
        {step > 0 && (
          <button
            onClick={() => setStep((s) => (s === 1 ? 0 : ((s - 1) as Step)))}
            className="w-10 h-10 rounded-full bg-surface shadow-card grid place-items-center text-ink"
            aria-label="Orqaga"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        <div className="flex-1">
          <Title className="text-[24px]">Chiqindini suratga oling</Title>
          <div className="flex gap-1.5 mt-3">
            {steps.map((label, i) => (
              <div
                key={label}
                className={`h-1.5 flex-1 rounded-pill transition-colors ${i <= step - 1 ? "bg-primary" : "bg-slate-200"}`}
              />
            ))}
          </div>
        </div>
      </header>

      {step === 0 && <StepPick onPick={pick} galleryRef={galleryRef} cameraRef={cameraRef} />}
      {step === 1 && photo && (
        <StepConfirm photo={photo} onConfirm={() => setStep(2)} onRetake={retake} />
      )}
      {step === 2 && (
        <StepLocation
          geo={geo}
          onRetry={() => geo.locate()}
          onNext={() => setStep(3)}
        />
      )}
      {step === 3 && (
        <StepInfo
          wasteType={wasteType}
          setWasteType={setWasteType}
          description={description}
          setDescription={setDescription}
          submitting={submitting}
          onSubmit={submit}
        />
      )}

      <input ref={cameraRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => pick(e.target.files?.[0] ?? null)} />
      <input ref={galleryRef} type="file" accept="image/*" hidden onChange={(e) => pick(e.target.files?.[0] ?? null)} />
    </Screen>
  );
}

function StepPick({
  onPick,
  galleryRef,
  cameraRef,
}: {
  onPick: (f: File | null) => void;
  galleryRef: React.RefObject<HTMLInputElement>;
  cameraRef: React.RefObject<HTMLInputElement>;
}) {
  return (
    <div className="space-y-4 animate-fade-up">
      <button
        onClick={() => cameraRef.current?.click()}
        className="w-full aspect-[4/3] rounded-[28px] border-2 border-dashed border-primary/50 bg-primary-soft grid place-items-center hover:border-primary transition-colors"
      >
        <div className="flex flex-col items-center gap-4 text-primary-deeper">
          <div className="w-20 h-20 rounded-full bg-white shadow-card grid place-items-center animate-pulse-soft">
            <Camera className="h-9 w-9" strokeWidth={1.8} />
          </div>
          <span className="text-[16px] font-bold">Kamera bilan suratga oling</span>
        </div>
      </button>

      <div className="grid grid-cols-2 gap-3">
        <Button variant="secondary" onClick={() => galleryRef.current?.click()}>
          <GalleryHorizontalEnd className="h-5 w-5" /> Galereyadan
        </Button>
        <Button variant="outline" onClick={() => onPick(null)} disabled>
          <Camera className="h-5 w-5" /> Namuna
        </Button>
      </div>
      <Subtitle className="text-center text-[13px]">
        Chiqindi aniq ko'ringan, yaqin masofadan olingan rasm yaxshiroq natija beradi.
      </Subtitle>
    </div>
  );
}

function StepConfirm({
  photo,
  onConfirm,
  onRetake,
}: {
  photo: string;
  onConfirm: () => void;
  onRetake: () => void;
}) {
  return (
    <div className="space-y-4 animate-fade-up">
      <div className="relative rounded-[28px] overflow-hidden shadow-card">
        <img src={photo} alt="oldindan ko'rish" className="w-full aspect-[4/3] object-cover" />
        <span className="absolute top-3 left-3 bg-ink/70 text-white text-[12px] font-semibold px-3 py-1.5 rounded-pill">
          Surat tanlandi
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" onClick={onRetake}>
          <RefreshCcw className="h-4 w-4" /> Qaytadan
        </Button>
        <Button onClick={onConfirm}>
          <Check className="h-4 w-4" /> Tasdiqlash
        </Button>
      </div>
    </div>
  );
}

function StepLocation({
  geo,
  onRetry,
  onNext,
}: {
  geo: {
    state: string;
    lat: number | null;
    lng: number | null;
    accuracy: number | null;
    error?: string;
    locate: () => void;
  };
  onRetry: () => void;
  onNext: () => void;
}) {
  const detecting = geo.state === "detecting" || geo.state === "idle";
  return (
    <div className="space-y-4 animate-fade-up">
      {detecting ? (
        <div className="rounded-card bg-surface shadow-card p-8 flex flex-col items-center text-center">
          <div className="relative w-16 h-16 mb-4">
            <span className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
            <span className="absolute inset-2 rounded-full bg-primary grid place-items-center">
              <MapPin className="h-7 w-7 text-white" />
            </span>
          </div>
          <p className="font-bold text-ink">Lokatsiya aniqlanmoqda…</p>
          <p className="text-muted text-[13px] mt-1">GPS signallari tekshirilmoqda</p>
        </div>
      ) : geo.lat && geo.lng ? (
        <>
          <div className="rounded-card overflow-hidden shadow-card h-56">
            <MiniMap lat={geo.lat} lng={geo.lng} interactive={false} />
          </div>
          <div className="flex items-center gap-2.5 rounded-pill">
            <div className="w-9 h-9 rounded-full bg-primary-soft grid place-items-center text-primary-deeper">
              <MapPin className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-[14px] font-bold text-ink">Lokatsiya aniqlandi</p>
              <p className="text-[12px] text-muted">
                {geo.lat.toFixed(6)}, {geo.lng.toFixed(6)}
                {geo.accuracy ? ` · ±${Math.round(geo.accuracy)} m` : ""}
              </p>
            </div>
            <button onClick={onRetry} className="text-primary-deeper text-[13px] font-semibold">
              Yangilash
            </button>
          </div>
          <Button onClick={onNext}>Davom etish</Button>
        </>
      ) : (
        <div className="rounded-card bg-surface shadow-card p-6 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full bg-danger/10 grid place-items-center text-danger mb-3">
            <MapPin className="h-7 w-7" />
          </div>
          <p className="font-bold text-ink">Lokatsiya yo'q</p>
          <p className="text-muted text-[13px] mt-1">{geo.error ?? "Xatolik yuz berdi."}</p>
          <Button className="mt-4" onClick={onRetry}>
            <RefreshCcw className="h-4 w-4" /> Qayta urinish
          </Button>
        </div>
      )}
    </div>
  );
}

function StepInfo({
  wasteType,
  setWasteType,
  description,
  setDescription,
  submitting,
  onSubmit,
}: {
  wasteType: string;
  setWasteType: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  submitting: boolean;
  onSubmit: () => void;
}) {
  return (
    <div className="space-y-5 animate-fade-up">
      <div>
        <p className="text-sm font-semibold text-ink mb-2">Chiqindi turi (ixtiyoriy)</p>
        <div className="flex flex-wrap gap-2">
          {WASTE_TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => setWasteType(t.value)}
              className={`px-4 py-2.5 rounded-pill text-[13px] font-semibold transition-all active:scale-95 ${
                wasteType === t.value
                  ? "bg-primary text-white shadow-floating"
                  : "bg-surface shadow-card text-ink"
              }`}
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div>
      </div>

      <label className="block">
        <span className="block text-sm font-semibold text-ink mb-2">Izoh (ixtiyoriy)</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Masalan: Sharoq yaqinida to'kilgan chiqindilar…"
          maxLength={1000}
          rows={4}
          className="w-full rounded-card bg-surface shadow-card px-4 py-4 text-[15px] placeholder:text-muted/70 text-ink"
        />
      </label>

      <Button loading={submitting} onClick={onSubmit}>
        <Send className="h-4 w-4" /> Xabarni yuborish
      </Button>
      <p className="text-center text-[12px] text-muted">
        Yuborish bilan siz xabarning haqiqiy ekanligini tasdiqlaysiz.
      </p>
    </div>
  );
}
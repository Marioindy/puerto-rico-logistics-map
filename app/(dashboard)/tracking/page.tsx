import MapView from "@/components/MapView";
import { Suspense } from "react";

const TrackingPage = () => (
  <div className="flex flex-col gap-6">
    <header className="flex flex-col gap-2">
      <p className="text-xs uppercase tracking-widest text-sky-400">Dashboard</p>
      <h1 className="text-3xl font-semibold text-white">Cargo and mission tracking</h1>
      <p className="max-w-2xl text-sm text-slate-300">
        This workspace will merge Convex queries, Amplify notifications, and Google Maps overlays to orchestrate inter-agency
        logistics. Wire your data sources into the sections below to unlock live situational awareness.
      </p>
    </header>

    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <section className="flex h-[540px] flex-col gap-4 rounded-xl border border-slate-800 bg-slate-950/70 p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold uppercase text-slate-300">Geospatial operations</h2>
            <p className="text-xs text-slate-500">Deploy overlays for ports, warehouses, and mission corridors.</p>
          </div>
        </div>
        <div className="flex-1 overflow-hidden rounded-lg">
          <Suspense fallback={<div className="flex h-full items-center justify-center text-slate-500">Hydrating map…</div>}>
            <MapView />
          </Suspense>
        </div>
      </section>

      <aside className="flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-950/70 p-4">
        <h2 className="text-sm font-semibold uppercase text-slate-300">Live incident feed</h2>
        <ol className="flex flex-1 flex-col gap-3 text-sm text-slate-200">
          {[
            "Open incidents from Convex queries will render here.",
            "Amplify PubSub or SNS alerts can surface as high-priority tickets.",
            "Assign response teams and update status directly from the feed."
          ].map((item) => (
            <li key={item} className="rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-2 text-slate-300">
              {item}
            </li>
          ))}
        </ol>
      </aside>
    </div>

    <section className="grid gap-4 rounded-xl border border-slate-800 bg-slate-950/60 p-4 md:grid-cols-3">
      {["Priority shipments", "Customs queues", "Mission assignments"].map((title) => (
        <article key={title} className="flex flex-col gap-2 rounded-lg border border-slate-800 bg-slate-950/80 p-4">
          <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
          <p className="text-xs text-slate-400">
            Replace this placeholder with a Convex query table or Amplify-backed workflow.
          </p>
        </article>
      ))}
    </section>
  </div>
);

export default TrackingPage;

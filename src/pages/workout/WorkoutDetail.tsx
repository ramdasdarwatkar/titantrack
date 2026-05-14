export default function WorkoutDetail() {
  return (
    <div className="flex flex-col gap-6">
      {/* HEADER */}
      <div className="space-y-2">
        <span className="px-3 py-1 text-xs font-bold uppercase tracking-widest bg-primary/20 text-primary rounded-full">
          In Progress
        </span>

        <h2 className="text-2xl font-black text-(--text-main)">
          Heavy Push Day
        </h2>
      </div>

      {/* SET LIST */}
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map((set) => (
          <div
            key={set}
            className="
              content-card
              p-5
              flex flex-row
              justify-between
              items-center
            "
          >
            <div className="flex flex-col">
              <span className="text-xs font-bold text-primary">SET {set}</span>

              <span className="text-lg font-bold text-(--text-main)">
                Bench Press
              </span>
            </div>

            <div className="flex gap-4">
              <div className="text-right">
                <p className="text-xs text-(--text-muted)">REPS</p>
                <p className="font-bold text-(--text-main)">10</p>
              </div>

              <div className="text-right">
                <p className="text-xs text-(--text-muted)">WEIGHT</p>
                <p className="font-bold text-(--text-main)">80kg</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <button className="btn-signin mt-6">Finish Workout</button>
    </div>
  );
}

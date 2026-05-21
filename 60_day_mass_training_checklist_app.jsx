import { useEffect, useMemo, useState } from "react";

export default function TrainingChecklistApp() {
  const [completedDays, setCompletedDays] = useState({});
  const [taskChecks, setTaskChecks] = useState({});
  const [workoutTimes, setWorkoutTimes] = useState({});
  const [activeTimer, setActiveTimer] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showAllDays, setShowAllDays] = useState(false);
  const [confirmDay, setConfirmDay] = useState(null);
  const days = Array.from({ length: 60 }, (_, i) => i + 1);

  const weeklyPlan = {
    1: {
      title: "Push Day",
      focus: "Грудь • Плечи • Трицепс",
      exercises: [
        "Жим штанги лёжа — 4×6-10",
        "Жим гантелей — 4×8-12",
        "Отжимания — 3×макс",
        "Жим вверх — 4×10",
        "Французский жим — 3×12",
      ],
      color: "bg-red-100",
      emoji: "🔥",
    },
    2: {
      title: "Pull Day",
      focus: "Спина • Бицепс",
      exercises: [
        "Подтягивания — 5 подходов",
        "Тяга штанги — 4×8-12",
        "Тяга гантели — 3×10",
        "Бицепс штанга — 4×10",
        "Молотки — 3×12",
      ],
      color: "bg-blue-100",
      emoji: "💪",
    },
    3: {
      title: "Leg Day",
      focus: "Ноги • Пресс",
      exercises: [
        "Присед со штангой — 5×6-10",
        "Румынская тяга — 4×10",
        "Выпады — 3×12",
        "Болгарские приседы — 3×10",
        "Пресс — 4 подхода",
      ],
      color: "bg-green-100",
      emoji: "🦵",
    },
    4: {
      title: "Recovery + Mobility",
      focus: "Восстановление",
      exercises: [
        "Растяжка — 10 мин",
        "Дыхание — 5-10 мин",
        "Ходьба — 20 мин",
        "Мобилити — 15 мин",
        "Лёгкий турник — 3 подхода",
      ],
      color: "bg-yellow-100",
      emoji: "🧘",
    },
    5: {
      title: "Upper Mass",
      focus: "Верх тела",
      exercises: [
        "Подтягивания — 5 подходов",
        "Жим лёжа — 4×8",
        "Тяга штанги — 4×8-12",
        "Жим сидя — 3×10",
        "Суперсеты — 3 раунда",
      ],
      color: "bg-purple-100",
      emoji: "⚡",
    },
    6: {
      title: "Arms + Pump",
      focus: "Руки • Памп",
      exercises: [
        "Махи — 5×15",
        "Жим Арнольда — 4×10",
        "Бицепс — 4×12",
        "Трицепс — 4×12",
        "Пресс — 4 подхода",
      ],
      color: "bg-pink-100",
      emoji: "🏋️",
    },
    0: {
      title: "Reset Day",
      focus: "Полное восстановление",
      exercises: [
        "Прогулка — 30 мин",
        "Растяжка — 10 мин",
        "Сон — 8+ часов",
        "Баня / душ",
        "Спокойствие",
      ],
      color: "bg-slate-100",
      emoji: "🌿",
    },
  };

  const completedCount = useMemo(
    () => Object.values(completedDays).filter(Boolean).length,
    [completedDays]
  );

  const remainingCount = 60 - completedCount;
  const progressPercent = Math.round((completedCount / 60) * 100);
  const currentDay = Math.min(completedCount + 1, 60);
  const yesterday = Math.max(currentDay - 1, 1);
  const tomorrow = Math.min(currentDay + 1, 60);
  const visibleDays = [yesterday, currentDay, tomorrow];

  useEffect(() => {
    const savedCompleted = localStorage.getItem("mass-system-completed-days");
    const savedTasks = localStorage.getItem("mass-system-task-checks");
    const savedTimes = localStorage.getItem("mass-system-workout-times");
    const savedTimer = localStorage.getItem("mass-system-active-timer");

    if (savedCompleted) setCompletedDays(JSON.parse(savedCompleted));
    if (savedTasks) setTaskChecks(JSON.parse(savedTasks));
    if (savedTimes) setWorkoutTimes(JSON.parse(savedTimes));
    if (savedTimer) setActiveTimer(JSON.parse(savedTimer));
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "mass-system-completed-days",
      JSON.stringify(completedDays)
    );
  }, [completedDays]);

  useEffect(() => {
    localStorage.setItem("mass-system-task-checks", JSON.stringify(taskChecks));
  }, [taskChecks]);

  useEffect(() => {
    localStorage.setItem(
      "mass-system-workout-times",
      JSON.stringify(workoutTimes)
    );
  }, [workoutTimes]);

  useEffect(() => {
    if (activeTimer) {
      localStorage.setItem("mass-system-active-timer", JSON.stringify(activeTimer));
    } else {
      localStorage.removeItem("mass-system-active-timer");
    }
  }, [activeTimer]);

  useEffect(() => {
    if (!activeTimer) return;

    const updateElapsed = () => {
      setElapsedSeconds(Math.floor((Date.now() - activeTimer.startedAt) / 1000));
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [activeTimer]);

  const formatTime = (seconds = 0) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}ч ${m}м ${s}с`;
    return `${m}м ${s}с`;
  };

  const startTimer = (day) => {
    if (day !== currentDay) return;
    setActiveTimer({ day, startedAt: Date.now() });
  };

  const finishTimer = (day) => {
    if (!activeTimer || activeTimer.day !== day) return;

    const totalSeconds = Math.floor((Date.now() - activeTimer.startedAt) / 1000);
    setWorkoutTimes((prev) => ({
      ...prev,
      [day]: {
        seconds: totalSeconds,
        finishedAt: new Date().toLocaleString(),
      },
    }));
    setActiveTimer(null);
    setElapsedSeconds(0);
  };

  const toggleTask = (day, task) => {
    if (day !== currentDay) return;

    setTaskChecks((prev) => {
      const updatedDayTasks = {
        ...prev[day],
        [task]: !prev?.[day]?.[task],
      };

      const updated = {
        ...prev,
        [day]: updatedDayTasks,
      };

      const allDone =
        updatedDayTasks.minimum &&
        updatedDayTasks.workout &&
        updatedDayTasks.stretch &&
        updatedDayTasks.recovery;

      if (allDone && !completedDays[day]) {
        setConfirmDay(day);
      }

      if (!allDone && completedDays[day]) {
        setCompletedDays((prevDays) => ({
          ...prevDays,
          [day]: false,
        }));
      }

      return updated;
    });
  };

  const completeDay = () => {
    if (!confirmDay) return;

    if (activeTimer?.day === confirmDay) {
      finishTimer(confirmDay);
    }

    setCompletedDays((prev) => ({
      ...prev,
      [confirmDay]: true,
    }));
    setConfirmDay(null);
  };

  const DayCard = ({ day, label }) => {
    const plan = weeklyPlan[day % 7];
    const isToday = day === currentDay;
    const isCompleted = completedDays[day];
    const locked = !isToday;
    const time = workoutTimes[day];
    const isTimerRunning = activeTimer?.day === day;

    return (
      <div
        className={`rounded-3xl p-5 transition border min-h-[620px] ${
          isCompleted
            ? "bg-white text-black border-white"
            : isToday
            ? `${plan.color} text-black border-white scale-[1.02] shadow-2xl`
            : label === "Ертең"
            ? "bg-gradient-to-br from-zinc-800 to-zinc-950 text-zinc-200 border-zinc-600"
            : "bg-zinc-950 text-zinc-400 border-zinc-800"
        }`}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm opacity-70 mb-1">{label}</p>
            <h3 className="text-3xl font-bold">Day {day}</h3>
            <p className="text-sm opacity-70 mt-1">{plan.title}</p>
            <p className="text-xs opacity-60 mt-1">{plan.focus}</p>
          </div>
          <span className="text-4xl">{plan.emoji}</span>
        </div>

        <div className="space-y-2 mb-5">
          {plan.exercises.map((exercise, index) => (
            <div
              key={index}
              className={`rounded-xl px-3 py-2 text-sm ${
                isToday || isCompleted ? "bg-white/50" : "bg-white/10"
              }`}
            >
              {exercise}
            </div>
          ))}
        </div>

        {time && (
          <div className="rounded-2xl p-3 text-sm mb-4 bg-black/20">
            ⏱ Уақыты: <b>{formatTime(time.seconds)}</b>
            <p className="text-xs opacity-70 mt-1">Бітті: {time.finishedAt}</p>
          </div>
        )}

        {locked ? (
          <div className="bg-black/20 rounded-2xl p-3 text-sm">
            🔒 Тек бүгінгі фокус қана орындалады
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-2xl p-4 bg-black/10">
              <p className="text-sm opacity-70 mb-2">Workout Timer</p>
              <h3 className="text-3xl font-bold mb-3">
                {isTimerRunning ? formatTime(elapsedSeconds) : "0м 0с"}
              </h3>

              {!isTimerRunning ? (
                <button
                  onClick={() => startTimer(day)}
                  className="w-full bg-black text-white rounded-xl py-3 font-semibold"
                >
                  ▶ Бастау
                </button>
              ) : (
                <button
                  onClick={() => finishTimer(day)}
                  className="w-full bg-white text-black rounded-xl py-3 font-semibold"
                >
                  ■ Таймерді аяқтау
                </button>
              )}
            </div>

            <ChecklistItem
              checked={taskChecks?.[day]?.minimum || false}
              onChange={() => toggleTask(day, "minimum")}
              title="Daily Minimum"
              text="50 отжиманий • 50 приседаний • 20 подтягиваний"
            />
            <ChecklistItem
              checked={taskChecks?.[day]?.workout || false}
              onChange={() => toggleTask(day, "workout")}
              title="Main Workout"
              text="Негізгі жаттығуды толық орындау"
            />
            <ChecklistItem
              checked={taskChecks?.[day]?.stretch || false}
              onChange={() => toggleTask(day, "stretch")}
              title="Stretching"
              text="Растяжка 5-15 минут"
            />
            <ChecklistItem
              checked={taskChecks?.[day]?.recovery || false}
              onChange={() => toggleTask(day, "recovery")}
              title="Recovery"
              text="Дыхание, медитация немесе прогулка"
            />
          </div>
        )}
      </div>
    );
  };

  const ChecklistItem = ({ checked, onChange, title, text }) => (
    <label className="flex items-start gap-3 text-sm bg-white/40 rounded-2xl p-3 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="mt-1"
      />
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-xs opacity-70">{text}</p>
      </div>
    </label>
  );

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-bold mb-3">60 DAYS MASS SYSTEM</h1>
          <p className="text-zinc-400 text-lg">
            Тренировки • Восстановление • Масса • Дисциплина
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800 text-center">
            <p className="text-zinc-400 mb-2">Орындалды</p>
            <h2 className="text-5xl font-bold">{completedCount}</h2>
            <p className="text-zinc-500 mt-2">күн</p>
          </div>

          <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800 text-center">
            <p className="text-zinc-400 mb-2">Қалды</p>
            <h2 className="text-5xl font-bold">{remainingCount}</h2>
            <p className="text-zinc-500 mt-2">күн</p>
          </div>

          <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800 text-center">
            <p className="text-zinc-400 mb-2">Прогресс</p>
            <h2 className="text-5xl font-bold">{progressPercent}%</h2>
            <p className="text-zinc-500 mt-2">60 күндік жол</p>
          </div>
        </div>

        <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-3xl font-bold">Жалпы прогресс</h2>
            <span className="text-zinc-400">{completedCount}/60</span>
          </div>

          <div className="w-full bg-zinc-800 rounded-full h-6 overflow-hidden">
            <div
              className="bg-white h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-5 mb-8">
          {visibleDays.map((day, index) => (
            <DayCard
              key={`${day}-${index}`}
              day={day}
              label={
                index === 0
                  ? "Кеше"
                  : index === 1
                  ? "Бүгінгі фокус"
                  : "Ертең"
              }
            />
          ))}
        </div>

        <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800 mb-8">
          <button
            onClick={() => setShowAllDays(!showAllDays)}
            className="w-full bg-zinc-800 hover:bg-zinc-700 rounded-2xl p-4 font-semibold mb-4"
          >
            {showAllDays ? "▲ 60 күнді жасыру" : "▼ Барлық 60 күнді ашу"}
          </button>

          {showAllDays && (
            <div className="grid grid-cols-10 gap-2">
              {days.map((day) => (
                <div
                  key={day}
                  className={`aspect-square rounded-xl text-sm font-bold flex items-center justify-center ${
                    completedDays[day]
                      ? "bg-white text-black scale-105"
                      : day === currentDay
                      ? "bg-zinc-600 text-white ring-2 ring-white"
                      : "bg-zinc-800 text-zinc-500"
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-3xl p-6 border border-zinc-700 text-center">
          <h2 className="text-3xl font-bold mb-3">🔥 Streak Mindset</h2>
          <p className="text-zinc-300 text-lg">
            Бір күн ауыр болса да, minimum орында. Цепь үзілмесін.
          </p>
        </div>
      </div>

      {confirmDay && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-50">
          <div className="bg-white text-black rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <h2 className="text-3xl font-bold mb-3">Күнді аяқтайсыз ба?</h2>
            <p className="text-zinc-600 mb-6">
              Барлық тапсырма белгіленді. Day {confirmDay} completed ретінде сақталсын ба?
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setConfirmDay(null)}
                className="bg-zinc-200 rounded-2xl py-3 font-semibold"
              >
                Жоқ
              </button>
              <button
                onClick={completeDay}
                className="bg-black text-white rounded-2xl py-3 font-semibold"
              >
                Иә, аяқтау
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

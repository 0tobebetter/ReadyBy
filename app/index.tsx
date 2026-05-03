import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useState, useEffect } from "react";
import { router } from "expo-router";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { t, Lang } from "../constants/i18n";

const SYS_FONT =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

const baseInput = {
  backgroundColor: "#f5f5f5",
  borderRadius: 10,
  padding: 12,
  // 16px prevents iOS/Android auto-zoom on focus
  fontSize: 16,
  border: "none",
  outline: "none",
  fontFamily: SYS_FONT,
  minWidth: 0,
} as React.CSSProperties;
const inputStyle = { ...baseInput, flex: 2 } as React.CSSProperties;
const minInputStyle = { ...baseInput, flex: 1 } as React.CSSProperties;
const addBtnStyle = {
  backgroundColor: "#000",
  color: "#fff",
  borderRadius: 10,
  width: 48,
  height: 48,
  fontSize: 24,
  fontFamily: SYS_FONT,
  border: "none",
  cursor: "pointer",
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
} as React.CSSProperties;

type Step = "home" | "result";

type Task = {
  id: string;
  name: string;
  duration: number;
};

type TimelineItem = {
  id: string;
  name: string;
  time: string;
  isArrival?: boolean;
};

function minsToDisplay(totalMins: number) {
  const h = Math.floor(totalMins / 60) % 24;
  const m = totalMins % 60;
  const isPM = h >= 12;
  const hour12 = h % 12 || 12;
  return `${String(hour12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${isPM ? "PM" : "AM"}`;
}

function minsToTimeValue(totalMins: number) {
  const h = Math.floor(totalMins / 60) % 24;
  const m = totalMins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function calculateTimeline(arrivalMins: number, tasks: Task[]): TimelineItem[] {
  const timeline: TimelineItem[] = [
    { id: "arrival", name: "arrive", time: minsToDisplay(arrivalMins), isArrival: true },
  ];
  let cursor = arrivalMins;
  for (const task of [...tasks].reverse()) {
    cursor -= task.duration;
    timeline.push({ id: task.id, name: task.name, time: minsToDisplay(cursor) });
  }
  return timeline.reverse();
}

function SortableTask({
  task,
  onRemove,
  editMode,
  onUpdateName,
  onUpdateDuration,
}: {
  task: Task;
  onRemove: (id: string) => void;
  editMode?: boolean;
  onUpdateName?: (id: string, name: string) => void;
  onUpdateDuration?: (id: string, duration: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: task.id });

  if (editMode) {
    return (
      <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }}>
        <View style={styles.taskRow}>
          <View style={styles.dragHandle} {...(attributes as any)} {...(listeners as any)}>
            <Text style={styles.dragIcon}>⠿</Text>
          </View>
          <TextInput
            style={[styles.editInput, { flex: 2 }]}
            value={task.name}
            onChangeText={(text) => onUpdateName?.(task.id, text)}
          />
          <TextInput
            style={[styles.editInput, { width: 56, marginLeft: 8 }]}
            value={String(task.duration)}
            onChangeText={(text) => onUpdateDuration?.(task.id, text)}
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.editRemoveBtn} onPress={() => onRemove(task.id)}>
            <Text style={styles.editRemoveBtnText}>✕</Text>
          </TouchableOpacity>
        </View>
      </div>
    );
  }

  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }}>
      <View style={styles.taskRow}>
        <View style={styles.dragHandle} {...(attributes as any)} {...(listeners as any)}>
          <Text style={styles.dragIcon}>⠿</Text>
        </View>
        <View style={styles.taskInfo}>
          <Text style={styles.taskName}>{task.name}</Text>
          <Text style={styles.taskDuration}>{task.duration} min</Text>
        </View>
        <TouchableOpacity onPress={() => onRemove(task.id)}>
          <Text style={styles.removeBtn}>✕</Text>
        </TouchableOpacity>
      </View>
    </div>
  );
}

function Footer({ T }: { T: (typeof t)["en"] }) {
  return (
    <View style={styles.footer}>
      <Text style={styles.footerText}>{T.copyright}</Text>
      <TouchableOpacity onPress={() => router.push("/privacy")}>
        <Text style={styles.footerLink}>{T.privacyPolicy}</Text>
      </TouchableOpacity>
    </View>
  );
}

function ConsentBanner({
  T,
  onAgree,
  onDecline,
}: {
  T: (typeof t)["en"];
  onAgree: () => void;
  onDecline: () => void;
}) {
  return (
    <View style={styles.consentBanner}>
      <Text style={styles.consentText}>
        {T.consentText1}
        <Text style={styles.consentBold}>{T.consentBold}</Text>
        {T.consentText2}
        <Text
          style={styles.consentTextLink}
          onPress={() => router.push("/privacy")}
        >
          {T.consentLink}
        </Text>
        {T.consentText3}
      </Text>
      <View style={styles.consentBtnRow}>
        <TouchableOpacity style={styles.consentAgreeBtn} onPress={onAgree}>
          <Text style={styles.consentAgreeBtnText}>{T.consentAgree}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.consentDeclineBtn} onPress={onDecline}>
          <Text style={styles.consentDeclineBtnText}>{T.consentDecline}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function App() {
  const [lang, setLang] = useState<Lang>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("lang") as Lang) || "en";
    }
    return "en";
  });

  const toggleLang = () => {
    const next = lang === "en" ? "ko" : "en";
    setLang(next);
    if (typeof window !== "undefined") localStorage.setItem("lang", next);
  };
  const [step, setStep] = useState<Step>("home");
  const [arrivalMins, setArrivalMins] = useState(12 * 60);
  const [tasks, setTasks] = useState<Task[]>([
    { id: "1", name: "Shower + get ready", duration: 60 },
    { id: "2", name: "Eat + dishes", duration: 60 },
    { id: "3", name: "Travel", duration: 60 },
  ]);
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskDuration, setNewTaskDuration] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("ga_consent");
      if (!stored) setShowConsent(true);
    }
  }, []);

  const handleConsent = (granted: boolean) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("ga_consent", granted ? "granted" : "denied");
    }
    setShowConsent(false);
  };

  const sensors = useSensors(useSensor(PointerSensor));
  const T = t[lang];

  const addTask = () => {
    if (!newTaskName || !newTaskDuration) return;
    setTasks([
      ...tasks,
      { id: Date.now().toString(), name: newTaskName, duration: parseInt(newTaskDuration) },
    ]);
    setNewTaskName("");
    setNewTaskDuration("");
  };

  const removeTask = (id: string) => setTasks(tasks.filter((task) => task.id !== id));

  const updateTaskName = (id: string, name: string) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, name } : task)));
  };

  const updateTaskDuration = (id: string, durStr: string) => {
    const duration = parseInt(durStr) || 0;
    setTasks(tasks.map((task) => (task.id === id ? { ...task, duration } : task)));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setTasks((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const totalMinutes = tasks.reduce((sum, task) => sum + task.duration, 0);
  const timeline = calculateTimeline(arrivalMins, tasks);

  // ── Screen 1: 시간 설정 + 할 일 목록 ────────────────────────────────────

  if (step === "home") {
    return (
      <View style={styles.outer}>
        <ScrollView
          style={{ width: "100%" }}
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }} />
            <TouchableOpacity
              style={styles.langBtn}
              onPress={toggleLang}
            >
              <Text style={styles.langBtnText}>
                {lang === "en" ? "한" : "EN"} ⇄ {lang === "en" ? "EN" : "한"}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>{T.title}</Text>
          <Text style={styles.subtitle}>{T.subtitle}</Text>
          <View style={styles.timeBox}>
            <input
              type="time"
              value={minsToTimeValue(arrivalMins)}
              onChange={(e) => {
                const [h, m] = e.target.value.split(":").map(Number);
                setArrivalMins(h * 60 + m);
              }}
              style={{
                fontSize: 48,
                fontWeight: "500",
                fontFamily: SYS_FONT,
                border: "none",
                background: "transparent",
                outline: "none",
                textAlign: "center",
                width: "100%",
                cursor: "pointer",
              }}
            />
          </View>

          <View style={styles.tasksSectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>{T.yourTasks}</Text>
              <Text style={styles.subtitle}>
                {T.arriveBy} {minsToDisplay(arrivalMins)}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.editModeBtn}
              onPress={() => setIsEditMode(!isEditMode)}
            >
              <Text style={styles.editModeBtnText}>
                {isEditMode ? T.done : T.edit}
              </Text>
            </TouchableOpacity>
          </View>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={tasks.map((task) => task.id)}
              strategy={verticalListSortingStrategy}
            >
              <div style={{ width: "100%" }}>
                {tasks.map((task) => (
                  <SortableTask
                    key={task.id}
                    task={task}
                    onRemove={removeTask}
                    editMode={isEditMode}
                    onUpdateName={updateTaskName}
                    onUpdateDuration={updateTaskDuration}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {isEditMode ? (
            <TouchableOpacity
              style={styles.deleteAllBtn}
              onPress={() => {
                setTasks([]);
                setIsEditMode(false);
              }}
            >
              <Text style={styles.deleteAllBtnText}>{T.deleteAll}</Text>
            </TouchableOpacity>
          ) : (
            <>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>{T.total}</Text>
                <Text style={styles.totalValue}>{totalMinutes} min</Text>
              </View>

              <Text style={styles.addTaskLabel}>{T.addTask}</Text>
              <div style={{ display: "flex", gap: "8px", marginBottom: 20 }}>
                <input
                  style={inputStyle}
                  placeholder={T.taskName}
                  value={newTaskName}
                  onChange={(e: any) => setNewTaskName(e.target.value)}
                />
                <input
                  style={minInputStyle}
                  inputMode="numeric"
                  placeholder={T.min}
                  value={newTaskDuration}
                  onChange={(e: any) => setNewTaskDuration(e.target.value)}
                  onKeyDown={(e: any) => e.key === "Enter" && addTask()}
                />
                <button onClick={addTask} style={addBtnStyle}>+</button>
              </div>

              <TouchableOpacity style={styles.calcBtn} onPress={() => setStep("result")}>
                <Text style={styles.calcBtnText}>{T.calculate}</Text>
              </TouchableOpacity>
            </>
          )}

          <Footer T={T} />
        </ScrollView>

        {showConsent && (
          <ConsentBanner
            T={T}
            onAgree={() => handleConsent(true)}
            onDecline={() => handleConsent(false)}
          />
        )}
      </View>
    );
  }

  // ── Screen 2: 결과 타임라인 ───────────────────────────────────────────────

  return (
    <View style={styles.outer}>
      <View style={[styles.container, { flex: 1 }]}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }} />
          <TouchableOpacity
            style={styles.langBtn}
            onPress={toggleLang}
          >
            <Text style={styles.langBtnText}>
              {lang === "en" ? "한" : "EN"} ⇄ {lang === "en" ? "EN" : "한"}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>{T.yourSchedule}</Text>
        <Text style={[styles.subtitle, { marginBottom: 32 }]}>
          {T.wakeUpBy} {timeline[0].time}
        </Text>

        <ScrollView style={{ width: "100%", marginBottom: 24 }}>
          {timeline.map((item, index) => (
            <View key={item.id} style={styles.timelineRow}>
              <View style={styles.dotCol}>
                <View style={[styles.dot, item.isArrival && styles.dotArrival]} />
                {index < timeline.length - 1 && <View style={styles.line} />}
              </View>
              <View style={styles.timelineContent}>
                <Text style={[styles.timelineTime, item.isArrival && styles.timelineTimeArrival]}>
                  {item.time}
                </Text>
                <Text style={styles.timelineName}>
                  {item.isArrival ? T.arrive : item.name}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>

        <TouchableOpacity style={styles.calcBtn}>
          <Text style={styles.calcBtnText}>{T.setAllAlarms}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backBtn} onPress={() => setStep("home")}>
          <Text style={styles.backBtnText}>{T.editTasks}</Text>
        </TouchableOpacity>

        <Footer T={T} />
      </View>

      {showConsent && (
        <ConsentBanner
          T={T}
          onAgree={() => handleConsent(true)}
          onDecline={() => handleConsent(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  container: {
    padding: 24,
    paddingTop: 24,
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  langBtn: {
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  langBtnText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#333",
  },
  title: {
    fontSize: 28,
    fontWeight: "500",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#888",
    marginBottom: 0,
  },
  timeBox: {
    backgroundColor: "#f5f5f5",
    borderRadius: 16,
    paddingVertical: 28,
    paddingHorizontal: 32,
    alignItems: "center",
    marginBottom: 32,
    marginTop: 24,
    width: "100%",
  },
  tasksSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "500",
    marginBottom: 4,
  },
  editModeBtn: {
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginTop: 2,
  },
  editModeBtnText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#333",
  },
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  dragHandle: {
    paddingRight: 12,
    cursor: "grab" as any,
  },
  dragIcon: {
    fontSize: 16,
    color: "#aaa",
  },
  taskInfo: {
    flex: 1,
  },
  taskName: {
    fontSize: 14,
    fontWeight: "500",
  },
  taskDuration: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
  removeBtn: {
    fontSize: 14,
    color: "#aaa",
    paddingLeft: 12,
  },
  editInput: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  editRemoveBtn: {
    backgroundColor: "#000",
    borderRadius: 8,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  editRemoveBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  deleteAllBtn: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    padding: 14,
    width: "100%",
    alignItems: "center",
    marginTop: 8,
  },
  deleteAllBtnText: {
    color: "#888",
    fontSize: 14,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    paddingVertical: 8,
    marginBottom: 8,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 13,
    color: "#888",
  },
  totalValue: {
    fontSize: 13,
    fontWeight: "500",
    color: "#000",
  },
  addTaskLabel: {
    fontSize: 13,
    color: "#888",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
  },
  addBtn: {
    backgroundColor: "#000",
    borderRadius: 10,
    width: 48,
    height: 48,
    flexShrink: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  addBtnText: {
    color: "#fff",
    fontSize: 24,
    lineHeight: 28,
  },
  calcBtn: {
    backgroundColor: "#000",
    borderRadius: 12,
    padding: 16,
    width: "100%",
    alignItems: "center",
    marginBottom: 8,
  },
  calcBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  footer: {
    alignItems: "center",
    paddingVertical: 32,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    marginTop: 16,
    gap: 6,
  },
  footerText: {
    fontSize: 12,
    color: "#bbb",
  },
  footerLink: {
    fontSize: 12,
    color: "#888",
    textDecorationLine: "underline",
  },
  consentBanner: {
    position: "absolute" as any,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#111",
    padding: 24,
    paddingBottom: 32,
  },
  consentText: {
    fontSize: 14,
    color: "#ccc",
    lineHeight: 22,
    marginBottom: 20,
  },
  consentBold: {
    fontWeight: "700",
    color: "#fff",
  },
  consentTextLink: {
    color: "#aaa",
    textDecorationLine: "underline",
  },
  consentBtnRow: {
    flexDirection: "row",
    gap: 12,
  },
  consentAgreeBtn: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
  },
  consentAgreeBtnText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "600",
  },
  consentDeclineBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#444",
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
  },
  consentDeclineBtnText: {
    color: "#aaa",
    fontSize: 14,
  },
  timelineRow: {
    flexDirection: "row",
    marginBottom: 0,
  },
  dotCol: {
    alignItems: "center",
    width: 24,
    marginRight: 16,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#000",
    marginTop: 4,
  },
  dotArrival: {
    backgroundColor: "#4A90E2",
  },
  line: {
    width: 1,
    flex: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 4,
    minHeight: 32,
  },
  timelineContent: {
    paddingBottom: 24,
    flex: 1,
  },
  timelineTime: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
  },
  timelineTimeArrival: {
    color: "#4A90E2",
  },
  timelineName: {
    fontSize: 13,
    color: "#888",
    marginTop: 2,
  },
  backBtn: {
    padding: 12,
    width: "100%",
    alignItems: "center",
  },
  backBtnText: {
    color: "#888",
    fontSize: 14,
  },
});

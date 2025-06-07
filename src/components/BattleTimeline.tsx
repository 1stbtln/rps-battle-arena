import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useGameStore } from "../store/gameStore";
import {
  Clock,
  Skull,
  Users,
  Play,
  Pause,
  Flag,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import rockImg from "../assets/rock.png";
import paperImg from "../assets/paper.png";
import scissorsImg from "../assets/scissors.png";

interface TimelineEvent {
  id: string;
  time: number; // milliseconds since battle start
  type: "kill" | "start" | "pause" | "end" | "deploy";
  description: string;
  details?: {
    killerId?: string;
    victimId?: string;
    killerType?: string;
    victimType?: string;
    deployCount?: number;
  };
}

interface BattleTimelineProps {
  className?: string;
}

export const BattleTimeline: React.FC<BattleTimelineProps> = ({
  className = "",
}) => {
  const { killFeed, isRunning, isPaused } = useGameStore();
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(
    null
  );
  const [page, setPage] = useState(0);
  const eventsPerPage = 8;

  // Initialize battle start time
  useEffect(() => {
    if (isRunning && !isPaused && !startTime) {
      setStartTime(Date.now());

      // Add start event
      const startEvent: TimelineEvent = {
        id: `start-${Date.now()}`,
        time: 0,
        type: "start",
        description: "Battle started",
      };

      setEvents([startEvent]);
    }
  }, [isRunning, isPaused, startTime]);

  // Update current time while battle is running
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && !isPaused && startTime) {
      interval = setInterval(() => {
        setCurrentTime(Date.now() - startTime);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, isPaused, startTime]);

  // Process kill feed into timeline events
  useEffect(() => {
    if (!startTime) return;

    const newEvents: TimelineEvent[] = [];

    // Update kill feed processing
    killFeed.forEach((kill) => {
      // Only process events that happened after the current battle started
      if (kill.timestamp >= startTime) {
        const timelineEvent: TimelineEvent = {
          id: kill.id,
          time: kill.timestamp - startTime,
          type: "kill",
          description: `${kill.killerType} eliminated ${kill.victimType}`,
          details: {
            killerId: kill.killerId,
            victimId: kill.victimId,
            killerType: kill.killerType,
            victimType: kill.victimType,
          },
        };

        newEvents.push(timelineEvent);
      }
    });

    // Merge with existing events, ensuring no duplicates
    const existingIds = events.map((e) => e.id);
    const uniqueNewEvents = newEvents.filter(
      (e) => !existingIds.includes(e.id)
    );

    if (uniqueNewEvents.length > 0) {
      setEvents((prev) =>
        [...prev, ...uniqueNewEvents].sort((a, b) => b.time - a.time)
      );
    }
  }, [killFeed, startTime]);

  // Handle pause events
  useEffect(() => {
    if (startTime && isPaused && isRunning) {
      const pauseEvent: TimelineEvent = {
        id: `pause-${Date.now()}`,
        time: Date.now() - startTime,
        type: "pause",
        description: "Battle paused",
      };

      setEvents((prev) =>
        [pauseEvent, ...prev].sort((a, b) => b.time - a.time)
      );
    } else if (startTime && !isPaused && isRunning) {
      const resumeEvent: TimelineEvent = {
        id: `resume-${Date.now()}`,
        time: Date.now() - startTime,
        type: "start",
        description: "Battle resumed",
      };

      setEvents((prev) =>
        [resumeEvent, ...prev].sort((a, b) => b.time - a.time)
      );
    }
  }, [isPaused, isRunning, startTime]);

  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000) % 60;
    const minutes = Math.floor(ms / (1000 * 60));
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case "kill":
        return <Skull size={16} className="text-red-400" />;
      case "start":
        return <Play size={16} className="text-green-400" />;
      case "pause":
        return <Pause size={16} className="text-yellow-400" />;
      case "end":
        return <Flag size={16} className="text-blue-400" />;
      case "deploy":
        return <Users size={16} className="text-purple-400" />;
      default:
        return null;
    }
  };

  const handleEventClick = (event: TimelineEvent) => {
    setSelectedEvent(event);
  };

  // Calculate total pages
  const totalPages = Math.ceil(events.length / eventsPerPage);

  // Get current page of events
  const currentEvents = events
    .slice(page * eventsPerPage, (page + 1) * eventsPerPage)
    .sort((a, b) => b.time - a.time);

  return (
    <motion.div
      className={`battle-timeline ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <Clock size={18} className="text-blue-400" />
          <h3 className="text-base font-semibold">Battle Timeline</h3>
        </div>
        <div className="current-time flex items-center text-sm">
          <Clock size={14} className="mr-1 opacity-70" />
          {startTime ? formatTime(currentTime) : "00:00"}
        </div>
      </div>

      {events.length > 0 ? (
        <>
          <div className="timeline-events space-y-1 mb-2">
            {currentEvents.map((event) => (
              <motion.button
                key={event.id}
                className={`w-full p-2 text-left flex items-center gap-2 rounded bg-white/5 hover:bg-white/10 border ${
                  selectedEvent?.id === event.id
                    ? "border-white/50"
                    : "border-white/10"
                }`}
                onClick={() => handleEventClick(event)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="event-time text-xs text-gray-400 w-10">
                  {formatTime(event.time)}
                </div>
                <div className="event-icon">{getEventIcon(event.type)}</div>
                <div className="event-description text-sm truncate">
                  {event.description}
                </div>
              </motion.button>
            ))}
          </div>

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="pagination flex justify-between items-center mt-2">
              <motion.button
                className="p-1 rounded bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:hover:bg-white/10"
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronLeft size={14} />
              </motion.button>

              <div className="text-xs text-gray-400">
                Page {page + 1} of {totalPages}
              </div>

              <motion.button
                className="p-1 rounded bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:hover:bg-white/10"
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page === totalPages - 1}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronRight size={14} />
              </motion.button>
            </div>
          )}

          {selectedEvent && selectedEvent.type === "kill" && (
            <div className="selected-event-details mt-3 p-2 bg-white/5 border border-white/10 rounded">
              <div className="flex justify-between">
                <div className="text-sm font-medium">Kill Details</div>
                <div className="text-xs text-gray-400">
                  {formatTime(selectedEvent.time)}
                </div>
              </div>

              {/* Update kill visualization in timeline */}
              <div className="kill-visualization flex items-center justify-center gap-2 my-3">
                <div className="killer p-2 rounded bg-white/20 border border-white/50">
                  <div className="text-lg text-center">
                    {selectedEvent.details?.killerType === "rock" && (
                      <img
                        src={rockImg}
                        className="w-6 h-6 mx-auto"
                        alt="Rock"
                      />
                    )}
                    {selectedEvent.details?.killerType === "paper" && (
                      <img
                        src={paperImg}
                        className="w-6 h-6 mx-auto"
                        alt="Paper"
                      />
                    )}
                    {selectedEvent.details?.killerType === "scissors" && (
                      <img
                        src={scissorsImg}
                        className="w-6 h-6 mx-auto"
                        alt="Scissors"
                      />
                    )}
                  </div>
                  <div className="text-xs text-center capitalize">
                    {selectedEvent.details?.killerType}
                  </div>
                </div>

                <div className="text-2xl text-red-500">→</div>

                <div className="victim p-2 rounded opacity-50 bg-white/20 border border-white/50">
                  <div className="text-lg text-center">
                    {selectedEvent.details?.victimType === "rock" && (
                      <img
                        src={rockImg}
                        className="w-6 h-6 mx-auto"
                        alt="Rock"
                      />
                    )}
                    {selectedEvent.details?.victimType === "paper" && (
                      <img
                        src={paperImg}
                        className="w-6 h-6 mx-auto"
                        alt="Paper"
                      />
                    )}
                    {selectedEvent.details?.victimType === "scissors" && (
                      <img
                        src={scissorsImg}
                        className="w-6 h-6 mx-auto"
                        alt="Scissors"
                      />
                    )}
                  </div>
                  <div className="text-xs text-center capitalize">
                    {selectedEvent.details?.victimType}
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-400">
                {selectedEvent.description}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-32 text-gray-400">
          <Clock size={24} className="mb-2 opacity-50" />
          <div className="text-sm">No battle events yet</div>
          <div className="text-xs mt-1">
            Events will appear once the battle starts
          </div>
        </div>
      )}
    </motion.div>
  );
};

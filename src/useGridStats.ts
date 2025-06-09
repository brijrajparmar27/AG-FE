import { useState, useEffect } from "react";
import { LineOfBusinessStats } from "./types";

const useGridStats = () => {
  const [stats, setStats] = useState<LineOfBusinessStats>({
    statuses: [],
    linesOfBusiness: [],
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(
          "http://localhost:3000/api/line-of-business-stats"
        );
        const data: LineOfBusinessStats = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, []);

  return stats;
};

export default useGridStats;

import { Request, Response } from "express";
import { env } from "../config/env";

export const oddsController = {
  async getBaseballMlbOdds(req: Request, res: Response) {
    try {
      const url = `${env.oddsApiBaseUrl}/sports/baseball_mlb/odds/?apiKey=${env.oddsApiKey}&regions=us&markets=h2h,spreads,totals&oddsFormat=american`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.error(`Failed to fetch MLB odds: ${response.status}`);
        return res.status(response.status).json({
          error: `Failed to fetch odds: ${response.statusText}`,
        });
      }

      const data = await response.json();
      return res.json(data);
    } catch (error) {
      console.error("Error fetching MLB odds:", error);
      return res.status(500).json({
        error: "Failed to fetch odds",
        message: (error as Error).message,
      });
    }
  },

  async getHistoricalBaseballMlbOdds(req: Request, res: Response) {
    try {
      const { date } = req.query;

      if (!date || typeof date !== "string") {
        return res.status(400).json({
          error: "Date parameter is required (format: YYYY-MM-DDTHH:MM:SSZ)",
        });
      }

      const url = `${env.oddsApiBaseUrl}/historical/sports/baseball_mlb/odds/?apiKey=${env.oddsApiKey}&regions=us&markets=h2h,spreads,totals&oddsFormat=american&date=${date}`;

      console.log(`Fetching historical odds from: ${url.replace(env.oddsApiKey, "***")}`);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        console.error(`Failed to fetch historical MLB odds: ${response.status}`, data);
        return res.status(response.status).json({
          error: `Failed to fetch historical odds: ${response.statusText}`,
          details: data,
        });
      }

      return res.json(data);
    } catch (error) {
      console.error("Error fetching historical MLB odds:", error);
      return res.status(500).json({
        error: "Failed to fetch historical odds",
        message: (error as Error).message,
      });
    }
  },

  async getEventOdds(req: Request, res: Response) {
    try {
      const { eventId } = req.params;

      if (!eventId || typeof eventId !== "string") {
        return res.status(400).json({
          error: "Event ID is required",
        });
      }

      const url = `${env.oddsApiBaseUrl}/sports/baseball_mlb/events/${eventId}/odds?apiKey=${env.oddsApiKey}&regions=us&markets=alternate_spreads,alternate_totals,team_totals,alternate_team_totals&oddsFormat=american`;

      console.log(`Fetching event odds from: ${url.replace(env.oddsApiKey, "***")}`);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        console.error(`Failed to fetch event odds: ${response.status}`, data);
        return res.status(response.status).json({
          error: `Failed to fetch event odds: ${response.statusText}`,
          details: data,
        });
      }

      return res.json(data);
    } catch (error) {
      console.error("Error fetching event odds:", error);
      return res.status(500).json({
        error: "Failed to fetch event odds",
        message: (error as Error).message,
      });
    }
  },

  async getGameDetails(req: Request, res: Response) {
    try {
      const { gameId } = req.params;

      if (!gameId || typeof gameId !== "string") {
        return res.status(400).json({
          error: "Game ID is required",
        });
      }

      const url = `${env.oddsApiBaseUrl}/sports/baseball_mlb/events/${gameId}/odds?apiKey=${env.oddsApiKey}&regions=us&markets=h2h,spreads,totals&oddsFormat=american`;

      console.log(`Fetching game details from: ${url.replace(env.oddsApiKey, "***")}`);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        console.error(`Failed to fetch game details: ${response.status}`, data);
        return res.status(response.status).json({
          error: `Failed to fetch game details: ${response.statusText}`,
          details: data,
        });
      }

      return res.json(data);
    } catch (error) {
      console.error("Error fetching game details:", error);
      return res.status(500).json({
        error: "Failed to fetch game details",
        message: (error as Error).message,
      });
    }
  },
};

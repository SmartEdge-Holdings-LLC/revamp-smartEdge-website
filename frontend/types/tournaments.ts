export type TournamentStatus = "active" | "inactive" | "completed";
export type PrizeType = "discount" | "freeMonth" | "custom";

export type TournamentPrize = {
  type: PrizeType;
  value: number;
  description?: string;
};

export type AdminTournament = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: TournamentStatus;
  gameIds: string[];
  prize: TournamentPrize;
  entries: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type LeaderboardEntry = {
  id: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  picks: string[];
  score: number;
  rank: number;
  prizeStatus: "unclaimed" | "claimed";
  updatedAt: string;
};

export type CreateTournamentPayload = {
  name: string;
  startDate: string;
  endDate: string;
  status?: TournamentStatus;
  gameIds?: string[];
  prize: TournamentPrize;
};

export type UpdateTournamentPayload = Partial<CreateTournamentPayload>;

export type ListTournamentsResponse = {
  tournaments: AdminTournament[];
};

export type LeaderboardResponse = {
  entries: LeaderboardEntry[];
};

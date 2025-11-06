const helpRequestFixtures = {
  oneHelpRequest: {
    id: 1,
    requesterEmail: "student@ucsb.edu",
    teamId: "Team 12",
    tableOrBreakoutRoom: "Table 1",
    requestTime: "2025-01-18T15:09:48.15",
    explanation: "PC is stuck in reboot cycle",
    solved: true
  },

  threeHelpRequests: [
    {
      id: 2,
      requesterEmail: "mike@ucsb.edu",
      teamId: "Team 3",
      tableOrBreakoutRoom: "Table 6",
      requestTime: "2024-02-26T15:09:48.30",
      explanation: "Pushing commits strip imports",
      solved: false
    },
    {
      id: 3,
      requesterEmail: "lisa@ucsb.edu",
      teamId: "Team 14",
      tableOrBreakoutRoom: "Breakout Room 4",
      requestTime: "2025-03-21T15:09:48.45",
      explanation: "Missing permission to access Git repository",
      solved: true
    },    
    {
      id: 4,
      requesterEmail: "tom@ucsb.edu",
      teamId: "Team 2",
      tableOrBreakoutRoom: "Table 17",
      requestTime: "2025-04-30T15:09:48.00",
      explanation: "PEBKAC Error",
      solved: false
    },
  ],
};

export { helpRequestFixtures };

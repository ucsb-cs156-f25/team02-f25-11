const recommendationRequestFixtures = {
  oneRecommendationRequest: [
    {
      id: 1,
      requesterEmail: "student@ucsb.edu",
      professorEmail: "prof@ucsb.edu",
      explanation: "Need letter for grad school",
      dateRequested: "2024-11-01T10:00:00",
      dateNeeded: "2024-12-01T10:00:00",
      done: false,
    },
  ],

  threeRecommendationRequests: [
    {
      id: 2,
      requesterEmail: "another.student@ucsb.edu",
      professorEmail: "another.prof@ucsb.edu",
      explanation: "Internship application",
      dateRequested: "2024-10-15T14:30:00",
      dateNeeded: "2024-11-15T09:00:00",
      done: true,
    },
    {
      id: 3,
      requesterEmail: "testuser1@ucsb.edu",
      professorEmail: "testprof1@ucsb.edu",
      explanation: "Scholarship application",
      dateRequested: "2024-11-03T11:00:00",
      dateNeeded: "2024-11-20T17:00:00",
      done: false,
    },
    {
      id: 4,
      requesterEmail: "testuser2@ucsb.edu",
      professorEmail: "testprof2@ucsb.edu",
      explanation: "REU program",
      dateRequested: "2024-09-01T08:00:00",
      dateNeeded: "2024-10-01T08:00:00",
      done: true,
    },
  ],
};

export { recommendationRequestFixtures };
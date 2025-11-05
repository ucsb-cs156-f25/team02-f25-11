const menuItemReviewFixtures = {
  oneReview: {
    id: 1,
    itemId: 1,
    reviewerEmail: "exampleOne@example.com",
    stars: 5,
    dateReviewed: "2022-01-02T12:00:00",
    comments: "supa yummy",
  },
  threeReviews: [
    {
      id: 1,
      itemId: 1,
      reviewerEmail: "exampleOne@example.com",
      stars: 5,
      dateReviewed: "2022-01-02T12:00:00",
      comments: "supa yummy",
    },
    {
      id: 2,
      itemId: 2,
      reviewerEmail: "exampleTwo@ucsb.edu",
      stars: 3,
      dateReviewed: "2022-04-03T14:30:00",
      comments: "valid food item",
    },
    {
      id: 3,
      itemId: 1,
      reviewerEmail: "exampleThree@gmail.com",
      stars: 4,
      dateReviewed: "2022-07-04T18:00:00",
      comments: "solid but i've had better",
    },
  ],
};

export { menuItemReviewFixtures };
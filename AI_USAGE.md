I have used Anthropic IDE made by Google(Model : Gemini 3.8 Flash) to build this project. I read the project description and instructed the AI to create this project. I checked the project manually to check if AI is following my instruction correctly.

AI made several mistakes while developing this project. I have listed some them here: 

- When implementing the concurrency row-level lock in `HoldService.cs`, the AI wrote raw SQL: 
`SELECT * FROM classes WHERE id = {classId} FOR UPDATE`
The AI assumed the PostgreSQL column was lowercase `id`. However, EF Core generates quoted PascalCase column names (`"Id"`). I noticed it and instructed AI to fix it.

- In the "My Applications" table, the AI initially displayed an expiration countdown for all applications, even for applications that were already `CONFIRMED`. I spotted it during testing the system manually and instructed AI to correct it.

- When setting `total seats` for a class, AI did not let Admin to delete the seat count entirely. I spotted it and instructed AI to fix it.

- AI added some code that automatically seeded some data into the database. But I instructed it not to add those data into the databse.
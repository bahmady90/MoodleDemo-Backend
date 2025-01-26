import express from 'express'; 
import pkg from 'pg'; 
import dotenv from 'dotenv';
import cors from "cors";


import OpenAI from "openai";
import { getQuiz } from './functions.js';

dotenv.config(); 
const { Client } = pkg;

const app = express(); 


const dbClient = new Client({
  connectionString: process.env.SUPABASE_DB_URL 
});


app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use((req, res, next) => {
    console.log(req.path, req.method);
    next();
})

app.use(cors());

dbClient.connect()
  .then(() => console.log('Connected to Supabase database'))
  .catch(err => console.error('Connection error', err.stack));


app.get('/:lf/questions', async (req, res) => {
  const { lf } = req.params;
  console.log("lf: " + lf); 
  try {
      const result = await dbClient.query('SELECT * FROM "fragen" WHERE lf = $1', [lf]);
      const data = result.rows;
      const questions = getQuiz(data)
      res.json(questions);
  } catch (err) {
      console.error('Error querying the database', err);
      res.status(500).send('Error querying the database');
  }
});

app.get('/:lf/allQuestions', async (req, res) => {
  const { lf } = req.params;  
  try {
      const result = await dbClient.query('SELECT * FROM "fragen" WHERE lf = $1', [lf]);
      const data = result.rows;
      res.json(data);
  } catch (err) {
      console.error('Error querying the database', err);
      res.status(500).send('Error querying the database');
  }
});

app.delete('/:id/questions', async (req, res) => {
  const { id } = req.params;
  console.log(id); 
  try {
    const result = await dbClient.query('DELETE FROM "fragen" WHERE id = $1', [id]);
    if (result.rowCount > 0) {
      res.status(200).json({ message: "Question deleted successfully." });
    } else {
      res.status(404).json({ message: "Question not found." });
    }
  } catch (err) {
    console.error('Error querying the database', err);
    res.status(500).send('Error querying the database');
  }
});


app.post("/questions", async (req, res) => {
  const fullQuestion = req.body;
  console.log(fullQuestion)

  try {
    const { lf, type, question, answers, rightAnswers, thema, apOne  } = fullQuestion;

    const query = `
      INSERT INTO "fragen" (lf, type, question, answers, "rightAnswers", thema, "apOne")
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;

    const result = await dbClient.query(query, [
      lf,
      type,
      question,
      JSON.stringify(answers),
      JSON.stringify(rightAnswers),
      thema, apOne
    ]);

    res.status(201).json({ message: "Question added successfully", data: result.rows[0] });
  } catch (err) {
    console.error("Error inserting question:", err);
    res.status(500).json({ message: "Failed to add question", error: err });
  }
});

app.patch("/questions", async (req, res) => {
  const fullQuestion = req.body;
  console.log(fullQuestion);

  const { id, lf, type, question, answers, rightAnswers, thema, apOne } = fullQuestion;

  try {
      const query = `UPDATE "fragen" SET lf = $1, type = $2, question = $3, answers = $4, "rightAnswers" = $5, thema = $6, "apOne" = $7 WHERE id = $8 RETURNING *;`

      const result = await dbClient.query(query, [
        lf,
        type,
        question,
        JSON.stringify(answers),
        JSON.stringify(rightAnswers),
        thema,
        apOne,
        id, 
      ]);

      if (result.rowCount === 0) {
        // No rows updated
        return res.status(404).json({
          message: "No question found with the given ID",
        });
      }

      res.status(200).json({
        message: "Question updated successfully",
        data: result.rows[0],
      });
    } catch (err) {
      console.error("Error updating question:", err);
      res.status(500).json({
        message: "Failed to update question",
        error: err.message, // Provide more detail for debugging
      });
    }
});



app.post("/ai", async (req, res) => {
  const content = req.body;
  const contentString = JSON.stringify(content);
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_KEY,
    });
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {"role": "user", "content": contentString},
      ],
    });
    console.log(completion.choices[0].message)
    res.json(completion.choices[0].message);
    } catch (err) {
    console.error('Error connecting to OpenAI', err);
    res.status(500).send('Error connecting to OpenAI');
    }
  
  
})

process.on('SIGINT', async () => {
  await dbClient.end();
  console.log('Database connection closed.');
  process.exit();
});


const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});







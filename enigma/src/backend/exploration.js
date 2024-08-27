import readline from 'readline';
import { promisify } from 'util';
import OpenAI from "openai";
const openai = new OpenAI();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = promisify(rl.question).bind(rl);

async function main() {
    try {
        const name = await question("What's your name? ");
        const theme = await question("What's the theme of the game? ");
        
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "You are a mastermind in a murder mystery game." },
                {
                    role: "user",
                    content: `Introduce the player in the second person point of view as an investigator named ${name} for a themed house that just had a murder of a John Doe. The theme is ${theme}. Explain that the house is shaped like icosahedron with 12 rooms and 30 different paths. Make it one to two sentences`,
                },
            ],
        });

        console.log(completion.choices[0].message['content']);
    } catch (error) {
        console.error('Error reading input:', error);
    } finally {
        rl.close();
    }
}

main();


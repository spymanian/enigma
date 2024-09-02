import React from 'react';
import { Button } from "@/components/ui/button"; // Adjust the import path as needed
import TextAdventureGame from '@/components/ui/TextAdventureGame';

const App: React.FC = () => {
    return (
        <div className="App">
            <header className="mb-4">
        <h1 className="text-2xl font-bold">Welcome to Enigma</h1>
      </header>
      <main>
        <section className="mb-4">
              <TextAdventureGame />
        </section>
        <section className="mb-4">
        </section>
      </main>
        <p>© 2024 Enigma. All rights reserved.</p>
        </div>
    );
};

export default App;
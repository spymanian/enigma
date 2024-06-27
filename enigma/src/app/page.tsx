import React from 'react';
import { Button } from "@/components/ui/button"; // Adjust the import path as needed

const Page: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <header className="mb-4">
        <h1 className="text-2xl font-bold">Welcome to Enigma</h1>
      </header>
      <main>
        <section className="mb-4">
          <p>This is a button.</p>
        </section>
        <section className="mb-4">
        </section>
        <section>
          <Button>Click Me</Button>
        </section>
      </main>
      <footer className="mt-4">
        <p>© 2024 Enigma. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Page;
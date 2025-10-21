import ChatBot from '@/components/ChatBot';

export default function Home() {
  return (
    <div className="h-screen bg-fog flex items-center justify-center py-4 px-4">
      <div className="w-full max-w-md h-full">
        <ChatBot className="h-full" />
      </div>
    </div>
  );
}

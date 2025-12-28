"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useState } from "react";
import Title from "../reuseabelComponents/Title";
// import { Button } from "../ui/button";

interface Message {
  id: string;
  content: string;
  sender: "planner" | "customer";
}

export default function Conversation() {
  const [messages] = useState<Message[]>([
    {
      id: "1",
      content: "Hi Alicia, how can I assist you today?",
      sender: "planner",
    },
    {
      id: "2",
      content: "Hello, I have an issue with my booking.",
      sender: "customer",
    },
    {
      id: "3",
      content: "The event was canceled. I need a refund.",
      sender: "customer",
    },
    { id: "4", content: "I will look into this for you.", sender: "planner" },
    { id: "5", content: "Thank you.", sender: "customer" },
    { id: "6", content: "You're welcome!", sender: "planner" },
    {
      id: "7",
      content: "The event was canceled. I need a refund.",
      sender: "customer",
    },
    { id: "8", content: "I will look into this for you.", sender: "planner" },
    { id: "9", content: "Thank you.", sender: "customer" },
    { id: "10", content: "You're welcome!", sender: "planner" },
  ]);

  return (
    <>
      {" "}
      <Title title="Conversation" />
      <div className="flex flex-col w-full mt-4 mx-auto bg-white rounded-[8px]">
        <div className="flex-1 space-y-4 py-5 px-20 ">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex items-start gap-2.5",
                message.sender === "customer" ? "justify-end" : "justify-start"
              )}
            >
              {message.sender === "planner" && (
                <Avatar className="w-8 h-8 border">
                  <AvatarImage
                    src="/placeholder.svg?height=32&width=32"
                    alt="Planner"
                  />
                  <AvatarFallback>P</AvatarFallback>
                </Avatar>
              )}

              <div
                className={cn(
                  "max-w-xs px-4 py-2 rounded-lg",
                  message.sender === "customer"
                    ? "bg-[#0033CC] text-white rounded-br-none"
                    : "bg-[#253B7E17] text-[#1B1E28] rounded-bl-none"
                )}
              >
                {message.sender === "planner" && (
                  <div className="text-xs text-gray-500 mb-1">Planner</div>
                )}
                <p className="text-sm">{message.content}</p>
              </div>

              {message.sender === "customer" && (
                <Avatar className="w-8 h-8 border">
                  <AvatarImage
                    src="/placeholder.svg?height=32&width=32"
                    alt="Customer"
                  />
                  <AvatarFallback>C</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}

          <form className="p-10 flex relative">
            <input
              type="text"
              className="w-full p-2 border rounded-lg relative"
              placeholder="chat with mehedi"
            />
            <button className="absolute right-12 top-[44px] inline-block px-2 py-1  rounded-[8px] text-[#003366] cursor-pointer">
              Sent
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

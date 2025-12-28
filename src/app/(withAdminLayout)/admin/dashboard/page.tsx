"use client";

import CalculateCard from "@/components/reuseabelComponents/calculateCard";
import Title from "@/components/reuseabelComponents/Title";
import Wrapper from "@/components/wrapper/wrapper";
import { UserListTable } from "@/components/AdminPage/UserManagement/UserListTable";

const DashboardPage = () => {
  return (
    <Wrapper>
      <div className="w-full  min-h-screen space-y-4 ">
        <Title title="Admin Dashboard" />
        <div className="space-y-5">
          <CalculateCard />
        </div>
        <div className="space-y-5">
          <UserListTable />
        </div>
      </div>
    </Wrapper>
  );
};

export default DashboardPage;

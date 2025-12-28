import { UserListTable } from "@/components/AdminPage/UserManagement/UserListTable";
import CalculateCard from "@/components/reuseabelComponents/calculateCard";
import Wrapper from "@/components/wrapper/wrapper";
import React from "react";

const userManagementPage = () => {
  return (
    <Wrapper>
      <div className="space-y-[28px]">
        <CalculateCard />
        <UserListTable />
      </div>
    </Wrapper>
  );
};

export default userManagementPage;

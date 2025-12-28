import { AllPayment } from "@/components/AdminPage/UserManagement/AllPayment";
import CalculateCard from "@/components/reuseabelComponents/calculateCard";
import Title from "@/components/reuseabelComponents/Title";
import Wrapper from "@/components/wrapper/wrapper";

const allPaymentPage = () => {
  return (
    <div className="">
      <Wrapper>
        <div className="space-y-[28px]">
          <Title title="All User Payment" />
          <CalculateCard />
          <AllPayment />
        </div>
      </Wrapper>
    </div>
  );
};

export default allPaymentPage;

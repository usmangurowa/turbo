import { redirect } from "next/navigation";

const WrappedPage = () => {
  redirect("/dashboard");
};

export default WrappedPage;

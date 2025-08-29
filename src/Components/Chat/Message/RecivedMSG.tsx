interface RecivedMSGProps {
  content: string;   
  sender: string;   
  avatar?: string;   
}

const RecivedMSG = ({ content, sender, avatar }: RecivedMSGProps) => {
  return (
    <div className="flex justify-end mb-4 cursor-pointer">
      <div className="flex max-w-96 bg-indigo-500 text-white rounded-lg p-3 gap-3 flex-col">
        <span className="text-sm font-semibold">{sender}</span>
        <p>{content}</p>
      </div>
      <div className="w-9 h-9 rounded-full flex items-center justify-center ml-2">
        <img
          src={
            avatar ||
            "https://placehold.co/200x/b7a8ff/ffffff.svg?text=ʕ•́ᴥ•̀ʔ&font=Lato"
          }
          alt={`${sender} Avatar`}
          className="w-8 h-8 rounded-full"
        />
      </div>
    </div>
  );
};

export default RecivedMSG;

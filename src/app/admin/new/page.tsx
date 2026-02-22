import ObjectForm from "@/components/admin/ObjectForm";

export default function NewObjectPage() {
  return (
    <div className="min-h-screen bg-dark p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-gold tracking-wider uppercase mb-6">
          立体物を新規登録
        </h1>
        <ObjectForm />
      </div>
    </div>
  );
}

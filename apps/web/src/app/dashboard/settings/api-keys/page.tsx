import { redirect } from "next/navigation";

const ApiKeysPage = () => {
  redirect("/dashboard");
};

export default ApiKeysPage;
/*
          <Icon icon={Key01Icon} className="text-muted-foreground h-4 w-4" />
        </div>
        <span className="font-medium">
          {row.original.name ?? "Unnamed Key"}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "start",
    header: "Key",
    cell: ({ row }) => (
      <code className="text-muted-foreground font-mono text-sm">
        {row.original.start}••••••••
      </code>
    ),
  },
  {
    accessorKey: "connectedEditors",
    header: "Connected Editors",
    cell: ({ row }) => {
      const editors = row.original.connectedEditors;
      if (editors.length === 0) {
        return (
          <span className="text-muted-foreground text-sm">No editors</span>
        );
      }
      return (
        <div className="flex flex-wrap items-center gap-2">
          {editors.map((editor) => {
            const editorInfo = EDITOR_ICONS[editor.toLowerCase()];
            if (editorInfo) {
              return (
                <Tooltip key={editor}>
                  <TooltipTrigger asChild>
                    <div className="bg-muted relative size-8 rounded-md p-1.5 transition-transform hover:scale-105">
                      <Image
                        src={editorInfo.logo}
                        alt={editorInfo.name}
                        fill
                        className="object-contain p-2 aria-[label='Windsurf']:dark:invert"
                        aria-label={editorInfo.name}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{editorInfo.name}</p>
                  </TooltipContent>
                </Tooltip>
              );
            }
            return (
              <Badge key={editor} variant="secondary">
                {editor}
              </Badge>
            );
          })}
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => {
      const createdAt = row.original.createdAt;
      if (!createdAt) {
        return <span className="text-muted-foreground text-sm">-</span>;
      }
      const date = new Date(createdAt);
      return (
        <span className="text-muted-foreground text-sm">
          {date.toLocaleDateString()}
        </span>
      );
    },
  },
  {
    accessorKey: "lastRequest",
    header: "Last Used",
    cell: ({ row }) => {
      const date = row.original.lastRequest
        ? new Date(row.original.lastRequest)
        : null;
      return (
        <span className="text-muted-foreground text-sm">
          {date ? date.toLocaleDateString() : "Never"}
        </span>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionsCell keyId={row.original.id} />,
  },
];

export default function ApiKeysPage() {
  const { data: sessionData, isPending: isSessionPending } = useSession();

  const { keys, isLoading, invalidate } = useApiKeys({
    enabled: !!sessionData?.user,
  });

  const handleKeyGenerated = () => {
    invalidate();
  };

  if (isSessionPending) {
    return (
      <main className="container flex flex-1 flex-col gap-8 px-4 py-8">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-5 w-80" />
        </div>
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </main>
    );
  }

  if (!sessionData) {
    return null;
  }

  return (
    <main className="container flex flex-1 flex-col gap-8 py-8">
      <PageHeader
        title="API Keys"
        description="Manage your API keys for the VS Code extension and other integrations."
      />

      {/* Generate New Key */}
      <section>
        <GenerateApiKey onKeyGenerated={handleKeyGenerated} />
      </section>

      {/* API Keys Table */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">Your API Keys</h2>
        <ApiKeysTable columns={columns} data={keys} isLoading={isLoading} />
      </section>
    </main>
  );
}
*/

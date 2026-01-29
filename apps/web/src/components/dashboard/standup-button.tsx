"use client";

export const StandupButton = () => null;

/*
            Standup
          </Button>
        </TooltipTrigger>
        <TooltipContent>Generate standup for yesterday</TooltipContent>
      </Tooltip>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Generate Standup</DialogTitle>
            <DialogDescription>
              Create a narrative standup report from your sessions.
            </DialogDescription>
          </DialogHeader>

          {!generatedStandup ? (
            <div className="flex flex-col gap-4 py-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Select Range</label>
                <Select
                  value={selectedRange}
                  onValueChange={(val) => setSelectedRange(val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yesterday">Yesterday</SelectItem>
                    <SelectItem value="Today">Today</SelectItem>
                    <SelectItem value="This Week">This Week</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={() => handleGenerate(selectedRange as DateRangeType)}
                disabled={isPending}
                loading={isPending}
              >
                {isPending ? "Generating..." : "Generate Report"}
              </Button>
            </div>
          ) : (
            <>
              <div className="rounded-md border p-4">
                <ScrollArea className="h-[300px] w-full">
                  <div className="text-sm leading-relaxed whitespace-pre-wrap">
                    {generatedStandup}
                  </div>
                </ScrollArea>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleGenerate("regenerate")}
                  disabled={isPending}
                  loading={isPending}
                  size={"sm"}
                >
                  Regenerate
                </Button>
                <Button onClick={handleCopy} disabled={isPending} size={"sm"}>
                  <HugeiconsIcon
                    icon={Copy01Icon}
                    altIcon={Tick02Icon}
                    showAlt={copied}
                  />
                  Copy
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
*/

"use client";

import { redirect } from "next/navigation";

const SettingsPage = () => {
  redirect("/dashboard");
};

export default SettingsPage;

/*

import { useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { useLocalPreferences } from "@/hooks/use-local-preferences";
import { useSession } from "@/hooks/use-session";
import { api } from "@/lib/api";
import {
  ArrowRight01Icon,
  CodeIcon,
  Key01Icon,
  Moon02Icon,
  Notification01Icon,
  Shield01Icon,
  UserCircleIcon,
} from "@hugeicons/core-free-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import debounce from "lodash.debounce";

import type { UserSettings } from "@turbo/validators";
import { Avatar, AvatarFallback, AvatarImage } from "@turbo/ui/avatar";
import { Badge } from "@turbo/ui/badge";
import { Button } from "@turbo/ui/button";
import {
  import { redirect } from "next/navigation";

  const SettingsPage = () => {
    redirect("/dashboard");
  };

  export default SettingsPage;
                  value={currentSettings.privacyMode}
                  onValueChange={(value: "normal" | "stealth") =>
                    handleSettingChange("privacyMode", value)
                  }
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="stealth">Stealth</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">
                      Break Reminder
                    </Label>
                    <p className="text-muted-foreground text-sm">
                      Remind you to take breaks after continuous coding.
                    </p>
                  </div>
                  <span className="text-muted-foreground text-sm tabular-nums">
                    {currentSettings.breakReminderMinutes === 0
                      ? "Off"
                      : `${currentSettings.breakReminderMinutes} min`}
                  </span>
                </div>
                <Slider
                  value={[currentSettings.breakReminderMinutes]}
                  onValueChange={([value]) =>
                    value !== undefined &&
                    handleSettingChange("breakReminderMinutes", value)
                  }
                  min={0}
                  max={180}
                  step={15}
                  className="w-full"
                />
                <p className="text-muted-foreground text-xs">
                  Set to 0 to disable reminders
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">
                      Session Timeout
                    </Label>
                    <p className="text-muted-foreground text-sm">
                      Gaps shorter than this count as coding time. Longer gaps
                      start a new session.
                    </p>
                  </div>
                  <span className="text-muted-foreground text-sm tabular-nums">
                    {currentSettings.sessionTimeoutMinutes} min
                  </span>
                </div>
                <Slider
                  value={[currentSettings.sessionTimeoutMinutes]}
                  onValueChange={([value]) =>
                    value !== undefined &&
                    handleSettingChange("sessionTimeoutMinutes", value)
                  }
                  min={1}
                  max={30}
                  step={1}
                  className="w-full"
                />
                <p className="text-muted-foreground text-xs">
                  Default: 15 min (matches wakatime). Lower = stricter tracking,
                  higher = more forgiving.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Data Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Icon icon={Shield01Icon} className="text-primary size-5" />
                <CardTitle>Privacy & Data</CardTitle>
              </div>
              <CardDescription>
                Control how your data is collected and used.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <SettingToggle
                id="enable-telemetry"
                label="Anonymous Analytics"
                description="Help improve Turbo by sending anonymous usage data."
                checked={currentSettings.enableTelemetry}
                onCheckedChange={(checked) =>
                  handleSettingChange("enableTelemetry", checked)
                }
              />

              <SettingToggle
                id="capture-symbols"
                label="Symbol Capture"
                description="Capture function and class names for richer AI session summaries. This data stays private."
                checked={currentSettings.captureSymbols}
                onCheckedChange={(checked) =>
                  handleSettingChange("captureSymbols", checked)
                }
              />

              <SettingToggle
                id="capture-commits"
                label="Commit Tracking"
                description="Track Git commits for session context and AI summaries. Works for commits from any source."
                checked={currentSettings.captureCommits}
                onCheckedChange={(checked) =>
                  handleSettingChange("captureCommits", checked)
                }
              />
            </CardContent>
          </Card>

          {/* API Keys Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Icon icon={Key01Icon} className="text-primary size-5" />
                <CardTitle>API Keys</CardTitle>
              </div>
              <CardDescription>
                Manage API keys for accessing the Turbo API and connecting
                editors.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Create and manage API keys to authenticate your development
                tools and track your coding metrics.
              </p>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button asChild>
                <Link href="/dashboard/settings/api-keys">
                  Manage API Keys
                  <Icon icon={ArrowRight01Icon} className="ml-2 size-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Appearance Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon icon={Moon02Icon} className="text-primary size-5" />
                  <CardTitle>Appearance</CardTitle>
                </div>
                <Badge variant="secondary" className="text-xs">
                  This device only
                </Badge>
              </div>
              <CardDescription>
                Customize the look and feel of the application.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Theme Preference</p>
                  <p className="text-muted-foreground text-sm">
                    Select your preferred interface theme.
                  </p>
                </div>
                <ThemeToggle />
              </div>

              <SettingToggle
                id="redirect-to-dashboard"
                label="Auto-redirect to Dashboard"
                description="When logged in, automatically go to your dashboard instead of the landing page."
                checked={localPreferences.redirectToDashboard}
                onCheckedChange={(checked) =>
                  setLocalPreference("redirectToDashboard", checked)
                }
              />
            </CardContent>
          </Card>

          {/* Notifications Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Icon
                  icon={Notification01Icon}
                  className="text-primary size-5"
                />
                <CardTitle>Notifications</CardTitle>
              </div>
              <CardDescription>
                Manage how you receive notifications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="weekly-digest">Weekly Digest</Label>
                  <p className="text-muted-foreground text-sm">
                    Receive a weekly summary of your coding activity.
                  </p>
                </div>
                <Switch id="weekly-digest" disabled />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="product-updates">Product Updates</Label>
                  <p className="text-muted-foreground text-sm">
                    Get notified about new features and improvements.
                  </p>
                </div>
                <Switch id="product-updates" defaultChecked disabled />
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </main>
  );
}
*/

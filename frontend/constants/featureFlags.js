// Central feature flags for temporarily disabling risky features during review
export const FEATURE_FLAGS = {
  DISABLE_GAME_AND_REDEEM: process.env.EXPO_PUBLIC_DISABLE_GAME_AND_REDEEM === "true" || false, // set to `true` to disable game/redeem flows
};

export default FEATURE_FLAGS;

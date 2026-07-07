import CreatePlanModal from "@/components/CreatePlanModal";
import { useEventWorkspaceViewModel } from "@/viewmodels/useEventWorkspaceViewModel";
import { useEventProposalsStyles } from "@/constants/styles/useEventProposalsStyles";
import ProposalCard from "./ProposalCard";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

interface EventTabProps {
  groupId: string;
  eventId: string;
  colors: any;
}

export default function EventProposalsTab({
  groupId,
  eventId,
  colors,
}: EventTabProps) {
  const vm = useEventWorkspaceViewModel(groupId, eventId);
  const styles = useEventProposalsStyles();
  const [modalVisible, setModalVisible] = useState(false);

  if (vm.isLoading && vm.plans.length === 0) {
    return (
      <View
        style={[styles.centerContainer, { backgroundColor: colors.background }]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (vm.error) {
    return (
      <View
        style={[styles.centerContainer, { backgroundColor: colors.background }]}
      >
        <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
        <Text style={[styles.errorText, { color: colors.error }]}>
          {vm.error}
        </Text>
      </View>
    );
  }

  const isPlanning = vm.stage === "planning";
  const isTieBreaker = vm.stage === "needs_tiebreaker";

  const handleVoteToggle = async (planId: string, hasVoted: boolean) => {
    if (!isPlanning) {
      Toast.show({
        type: "info",
        text1: "Voting Closed",
        text2: "You can only vote during the planning stage.",
      });
      return;
    }

    if (hasVoted) {
      await vm.revokeVotePlan(planId);
    } else {
      await vm.votePlan(planId);
    }
  };

  const handleResolveTie = async (planId: string) => {
    if (!vm.isCreator) return;
    await vm.resolveTie(planId);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Tie Breaker Banner */}
      {isTieBreaker && (
        <View
          style={[
            styles.warningBanner,
            { backgroundColor: colors.error + "10", borderColor: colors.error },
          ]}
        >
          <Ionicons name="git-branch" size={20} color={colors.error} />
          <View style={styles.bannerTextContainer}>
            <Text style={[styles.bannerTitle, { color: colors.error }]}>
              {vm.isCreator
                ? "Resolve Event Tie"
                : "Awaiting Creator Tie-Breaker"}
            </Text>
            <Text
              style={[styles.bannerSub, { color: colors.onSurfaceVariant }]}
            >
              {vm.isCreator
                ? "The voting period ended in a tie. Select one of the tied options (highlighted below) to finalize the event."
                : "The voting period ended in a tie. The event creator is choosing the final plan."}
            </Text>
          </View>
        </View>
      )}

      {/* Proposals List */}
      <FlatList
        data={vm.plans}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshing={vm.isLoading}
        onRefresh={vm.refetchAll}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="document-text-outline"
              size={64}
              color={colors.placeholder}
            />
            <Text style={[styles.emptyTitle, { color: colors.onSurface }]}>
              No Proposals Yet
            </Text>
            <Text style={[styles.emptySub, { color: colors.onSurfaceVariant }]}>
              No plan proposals have been submitted for this event yet. Propose
              the first option below!
            </Text>
            {isPlanning && (
              <Pressable
                style={[
                  styles.emptyButton,
                  { backgroundColor: colors.primary },
                ]}
                onPress={() => setModalVisible(true)}
              >
                <Text
                  style={[styles.emptyButtonText, { color: colors.onPrimary }]}
                >
                  Propose Plan
                </Text>
              </Pressable>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <ProposalCard
            plan={item}
            isPlanning={isPlanning}
            isTieBreaker={isTieBreaker}
            isTied={vm.tiedPlanIds.has(item.id)}
            isCreator={vm.isCreator}
            isResolvingTie={vm.isResolvingTie}
            onVoteToggle={handleVoteToggle}
            onResolveTie={handleResolveTie}
          />
        )}
      />

      {/* Floating Action Button for Plan Proposals */}
      {isPlanning && vm.eventDetails && (
        <Pressable
          style={[styles.fab, { backgroundColor: colors.primary }]}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={24} color={colors.onPrimary} />
        </Pressable>
      )}

      {/* Proposal Creation Modal */}
      {vm.eventDetails && (
        <CreatePlanModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onSubmit={vm.createPlan}
          isSubmitting={vm.isCreatingPlan}
          eventDetails={vm.eventDetails}
        />
      )}
    </View>
  );
}

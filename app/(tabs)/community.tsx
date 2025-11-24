import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Heart, MessageCircle, Share, MoveHorizontal as MoreHorizontal, Plus, TrendingUp } from 'lucide-react-native';

export default function CommunityTab() {
  const [activeTab, setActiveTab] = useState<'feed' | 'discussions' | 'trending'>('feed');

  const posts = [
    {
      id: 1,
      author: 'Ahmad Rahman',
      timeAgo: '2 hours ago',
      content: 'SubhanAllah, just finished reading Surah Ar-Rahman. The repetition of "فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَان" (Which of the favors of your Lord will you deny?) is so powerful. Every verse reminds us of Allah\'s countless blessings. May we always be grateful. 🤲',
      likes: 45,
      comments: 12,
      shares: 8,
      hasLiked: false,
      type: 'reflection'
    },
    {
      id: 2,
      author: 'Fatima Al-Zahra',
      timeAgo: '5 hours ago',
      content: 'Alhamdulillah for completing my first week of Fajr prayers on time! It\'s amazing how this simple act has brought so much barakah to my day. For anyone struggling, start small - even 10 minutes earlier each day helps. May Allah make it easy for all of us.',
      likes: 78,
      comments: 23,
      shares: 15,
      hasLiked: true,
      type: 'achievement'
    },
    {
      id: 3,
      author: 'Omar Ibn Abdullah',
      timeAgo: '8 hours ago',
      content: 'Beautiful hadith for today: "The believer is not one who eats his fill while his neighbor goes hungry." - Prophet Muhammad ﷺ. Let\'s remember our responsibility to our community and those in need.',
      likes: 92,
      comments: 18,
      shares: 34,
      hasLiked: false,
      type: 'hadith'
    },
  ];

  const discussions = [
    {
      id: 1,
      title: 'Understanding the concept of Qadar in Islam',
      author: 'Dr. Sarah Hassan',
      replies: 24,
      lastActivity: '1 hour ago',
      category: 'Aqeedah'
    },
    {
      id: 2,
      title: 'Best practices for teaching Quran to children',
      author: 'Ustadha Aisha',
      replies: 45,
      lastActivity: '3 hours ago',
      category: 'Education'
    },
    {
      id: 3,
      title: 'Balancing work and Islamic obligations',
      author: 'Brother Khalil',
      replies: 67,
      lastActivity: '5 hours ago',
      category: 'Lifestyle'
    },
  ];

  const getPostIcon = (type: string) => {
    switch (type) {
      case 'reflection': return '💭';
      case 'achievement': return '🎉';
      case 'hadith': return '📿';
      default: return '💬';
    }
  };

  const renderPost = (post: any) => (
    <View key={post.id} style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.authorInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {post.author.split(' ').map((name: string) => name[0]).join('')}
            </Text>
          </View>
          <View>
            <Text style={styles.authorName}>{post.author}</Text>
            <Text style={styles.timeAgo}>{post.timeAgo}</Text>
          </View>
        </View>
        <View style={styles.postTypeIcon}>
          <Text style={styles.postTypeEmoji}>{getPostIcon(post.type)}</Text>
        </View>
      </View>

      <Text style={styles.postContent}>{post.content}</Text>

      <View style={styles.postActions}>
        <TouchableOpacity style={[styles.actionButton, post.hasLiked && styles.likedButton]}>
          <Heart size={18} color={post.hasLiked ? '#EF4444' : '#6B7280'} />
          <Text style={[styles.actionText, post.hasLiked && styles.likedText]}>
            {post.likes}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <MessageCircle size={18} color="#6B7280" />
          <Text style={styles.actionText}>{post.comments}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Share size={18} color="#6B7280" />
          <Text style={styles.actionText}>{post.shares}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.moreButton}>
          <MoreHorizontal size={18} color="#6B7280" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderDiscussion = (discussion: any) => (
    <TouchableOpacity key={discussion.id} style={styles.discussionCard}>
      <View style={styles.discussionHeader}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{discussion.category}</Text>
        </View>
        <Text style={styles.discussionTime}>{discussion.lastActivity}</Text>
      </View>
      <Text style={styles.discussionTitle}>{discussion.title}</Text>
      <View style={styles.discussionFooter}>
        <Text style={styles.discussionAuthor}>by {discussion.author}</Text>
        <View style={styles.replyInfo}>
          <MessageCircle size={14} color="#6B7280" />
          <Text style={styles.replyCount}>{discussion.replies} replies</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Community</Text>
        <Text style={styles.subtitle}>Connect & Share</Text>
        <TouchableOpacity style={styles.newPostButton}>
          <Plus size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabSelector}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'feed' && styles.activeTab]}
          onPress={() => setActiveTab('feed')}
        >
          <Text style={[styles.tabText, activeTab === 'feed' && styles.activeTabText]}>
            Feed
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'discussions' && styles.activeTab]}
          onPress={() => setActiveTab('discussions')}
        >
          <Text style={[styles.tabText, activeTab === 'discussions' && styles.activeTabText]}>
            Discussions
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'trending' && styles.activeTab]}
          onPress={() => setActiveTab('trending')}
        >
          <TrendingUp size={16} color={activeTab === 'trending' ? '#059669' : '#6B7280'} />
          <Text style={[styles.tabText, activeTab === 'trending' && styles.activeTabText]}>
            Trending
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'feed' && (
          <View style={styles.section}>
            {posts.map(renderPost)}
          </View>
        )}

        {activeTab === 'discussions' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active Discussions</Text>
            {discussions.map(renderDiscussion)}
          </View>
        )}

        {activeTab === 'trending' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Trending Topics</Text>
            <View style={styles.trendingItem}>
              <Text style={styles.trendingText}>#RamadanReflections</Text>
              <Text style={styles.trendingCount}>245 posts</Text>
            </View>
            <View style={styles.trendingItem}>
              <Text style={styles.trendingText}>#FajrChallenge</Text>
              <Text style={styles.trendingCount}>189 posts</Text>
            </View>
            <View style={styles.trendingItem}>
              <Text style={styles.trendingText}>#QuranMeaning</Text>
              <Text style={styles.trendingCount}>156 posts</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  newPostButton: {
    backgroundColor: '#059669',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabSelector: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  activeTab: {
    borderBottomColor: '#059669',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#059669',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  timeAgo: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  postTypeIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postTypeEmoji: {
    fontSize: 20,
  },
  postContent: {
    fontSize: 16,
    lineHeight: 24,
    color: '#1F2937',
    marginBottom: 16,
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginRight: 20,
  },
  likedButton: {
    // Additional styling for liked state if needed
  },
  actionText: {
    fontSize: 14,
    color: '#6B7280',
  },
  likedText: {
    color: '#EF4444',
  },
  moreButton: {
    marginLeft: 'auto',
  },
  discussionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  discussionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4338CA',
  },
  discussionTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  discussionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  discussionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  discussionAuthor: {
    fontSize: 14,
    color: '#6B7280',
  },
  replyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  replyCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  trendingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  trendingText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#059669',
  },
  trendingCount: {
    fontSize: 14,
    color: '#6B7280',
  },
});
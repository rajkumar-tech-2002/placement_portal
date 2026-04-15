import axios from 'axios';

const LEETCODE_GRAPHQL_URL = 'https://leetcode.com/graphql/';

/**
 * Extracts the username from a LeetCode profile URL.
 * Supports formats:
 * - https://leetcode.com/u/username/
 * - https://leetcode.com/username/
 * - https://leetcode.com/u/username
 * - https://leetcode.com/username
 */
export const extractUsername = (profileUrl) => {
    if (!profileUrl) return null;
    
    // Clean trailing slash
    let url = profileUrl.trim();
    if (url.endsWith('/')) url = url.slice(0, -1);
    
    // Regular profile URL: https://leetcode.com/username
    // New profile URL: https://leetcode.com/u/username
    const parts = url.split('/');
    const lastPart = parts[parts.length - 1];
    
    // If empty or invalid
    if (!lastPart) return null;

    // Check if it's a known URL format
    if (url.includes('leetcode.com/u/')) {
        return lastPart;
    }
    
    if (url.includes('leetcode.com/')) {
        // Handle cases like leetcode.com/username
        return lastPart;
    }
    
    // If it doesn't look like a URL, maybe it's already a username
    if (!url.includes('://')) {
        return url;
    }
    
    return null;
};

/**
 * Fetches user profile data from LeetCode GraphQL API.
 */
export const fetchLeetCodeData = async (username) => {
    // Detailed query for 2024-2025
    const query = `
    query getUserProfile($username: String!) {
        allQuestionsCount {
            difficulty
            count
        }
        matchedUser(username: $username) {
            username
            profile {
                ranking
                realName
            }
            submitStats: submitStatsGlobal {
                acSubmissionNum {
                    difficulty
                    count
                }
            }
        }
        userContestRanking(username: $username) {
            attendedContestsCount
            rating
            globalRanking
            totalParticipants
            topPercentage
        }
        userContestRankingHistory(username: $username) {
            attended
            rating
            ranking
            problemsSolved
            totalProblems
            contest {
                title
                startTime
            }
        }
    }`;

    const variables = { username };
    console.log(`[FETCHER] Fetching ultra-extended data for: ${username}`);

    try {
        const response = await axios.post(
            LEETCODE_GRAPHQL_URL,
            { query, variables },
            { 
                headers: { 
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Referer': 'https://leetcode.com/'
                },
                timeout: 10000 // 10s timeout
            }
        );

        if (response.data.errors) {
            throw new Error(response.data.errors[0].message);
        }

        const data = response.data.data;
        
        if (!data.matchedUser) {
            throw new Error('User not found on LeetCode');
        }

        const stats = data.matchedUser.submitStats.acSubmissionNum;
        const qCount = data.allQuestionsCount;
        const contestRanking = data.userContestRanking;
        const contestHistory = data.userContestRankingHistory || [];

        // Helper to find count by difficulty
        const getCount = (arr, diff) => arr.find(s => s.difficulty === diff)?.count || 0;
        
        // Find last attended contest
        const lastContest = [...contestHistory].reverse().find(c => c.attended);

        return {
            username: data.matchedUser.username,
            name: data.matchedUser.profile.realName,
            ranking: data.matchedUser.profile.ranking,
            totalSolved: getCount(stats, 'All'),
            easySolved: getCount(stats, 'Easy'),
            mediumSolved: getCount(stats, 'Medium'),
            hardSolved: getCount(stats, 'Hard'),
            totalQuestions: getCount(qCount, 'All'),
            totalEasy: getCount(qCount, 'Easy'),
            totalMedium: getCount(qCount, 'Medium'),
            totalHard: getCount(qCount, 'Hard'),
            contestRating: Math.round(contestRanking?.rating || 0),
            globalRanking: contestRanking?.globalRanking || 0,
            totalParticipants: contestRanking?.totalParticipants || 0,
            attendedContests: contestRanking?.attendedContestsCount || 0,
            lastContestName: lastContest?.contest.title || null,
            lastContestDate: lastContest ? new Date(lastContest.contest.startTime * 1000) : null,
            lastContestRank: lastContest?.ranking || null,
            lastContestSolved: lastContest?.problemsSolved || 0,
            lastContestTotal: lastContest?.totalProblems || 0
        };
    } catch (error) {
        throw new Error(`LeetCode API Error: ${error.message}`);
    }
};

/**
 * Helper to add delay between requests
 */
export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

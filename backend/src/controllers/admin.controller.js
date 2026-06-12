/**
 * Admin-only controller — stats, job/user management, manual scraper trigger.
 *
 * All routes are mounted under /api/admin with protect + restrictTo('admin').
 * Deletes SavedJob rows before Job/User deletes to satisfy foreign keys.
 */

const prisma = require('../config/db')
const {scrapeJobs}= require('../scraper')


/** Build calandar-day buckets for the last 7 days (charts) */

function last7DayRanges(){
    return Array.from({length: 7}, (_, i)=>{
        const date = new.Date()
        date.setDate(date.getDate() - (6 - i))
        date.setHours(0,0,0,0)
        return date
    })
}

/**
 * Platform analytics for the admin dashboard (stat cards + Chart.js series).
 * Returns counts, status breakdown, daily trends, and top saved jobs.
 */

exports.getStats = async (req , res) => {
    try{

        

    }catch(err){

    }
}

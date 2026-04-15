import DriveWillingness from '../models/driveWillingness.model.js';
import Company from '../models/company.model.js';

export const markWillingness = async (req, res) => {
    try {
        const { companyId, studentRegNo, status, remarks, department, cambus_details } = req.body;
        const coordinatorId = req.user.userId;

        await DriveWillingness.markWillingness({
            companyId,
            studentRegNo,
            status,
            coordinatorId,
            remarks,
            department,
            cambus_details
        });

        res.json({ message: 'Status updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getDriveAttendance = async (req, res) => {
    try {
        const { id } = req.params;
        const { campus, department, role } = req.user;
        
        // Use the existing Company model to get eligible students
        let students = await Company.getEligibleStudents(id);
        
        // Coordinator Filter: only show their own campus and department
        if (role === 'COORDINATOR') {
            students = students.filter(s => 
                (campus === 'Both' || s.cambus_details === campus) && 
                s.department === department
            );
        }
        
        // Sync eligible students to the drive_willingness table
        await DriveWillingness.syncEligibleStudents(id, students);
        
        // Get existing willingness records
        const willingness = await DriveWillingness.getWillingnessByCompany(id);
        
        // Map willingness to students
        const studentsWithStatus = students.map(student => {
            const statusRecord = willingness.find(w => w.student_reg_no === student.reg_no);
            return {
                ...student,
                willing_status: statusRecord ? statusRecord.status : 'Willing',
                remarks: statusRecord ? statusRecord.remarks : '',
                updated_at: statusRecord ? statusRecord.updated_at : null
            };
        });

        res.json(studentsWithStatus);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getCoordinatorDrives = async (req, res) => {
    try {
        const campus = req.user.role === 'ADMIN' ? 'Both' : req.user.campus;
        const department = req.user.role === 'ADMIN' ? null : req.user.department;
        const drives = await DriveWillingness.getDrivesByCampus(campus, department);
        res.json(drives);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getWillingStudents = async (req, res) => {
    try {
        const { id } = req.params;
        const students = await DriveWillingness.getWillingStudents(id);
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

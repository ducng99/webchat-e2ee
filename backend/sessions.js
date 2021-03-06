import { GenerateRandomString } from "./utilities.js"

class SessionsHandler
{
    constructor()
    {
        this.con;
    }

    CreateSession(username, callback)
    {
        let sql = "INSERT INTO `Sessions` (SessionID, UserID, ExpireTime) VALUES (?, (SELECT UserID FROM `Users` WHERE Username = ?), ?);";
        let sessionID = GenerateRandomString(256);
        let expireTime = Math.floor(Date.now() / 1000) + 60 * 15;
        this.con.query(sql, [sessionID, username, expireTime], function (err, result)
        {
            if (err)
            {
                console.error(err);
                callback(null);
            }
            else
            {
                callback(sessionID);
            }
        });
    }

    GetSession(sessionID, callback)
    {
        if (sessionID)
        {
            let sql = "SELECT u.UserID, u.Username, u.PublicKey FROM `Sessions` s, `Users` u WHERE s.SessionID = ? AND s.UserID = u.UserID";
            this.con.query(sql, [sessionID], function (err, result)
            {
                if (err)
                {
                    console.error(err);
                    callback({ status: false });
                }
                else
                {
                    if (result.length > 0)
                        callback({ status: true, user: result[0] });
                    else
                        callback({ status: false });
                }
            });
        }
        else
        {
            console.log("GetSession: Missing session ID");
            callback({ status: false });
        }
    }

    KeepAlive(sessionID, callback)
    {
        if (sessionID)
        {
            let sql = "UPDATE `Sessions` SET ExpireTime = ? WHERE SessionID = ?";
            let expireTime = Math.floor(Date.now() / 1000) + 60 * 15;

            this.con.query(sql, [expireTime, sessionID], function (err)
            {
                if (err)
                {
                    console.error(err);
                    callback({ status: false });
                }
                else
                {
                    callback({ status: true });
                }
            });
        }
    }
}

export default new SessionsHandler();
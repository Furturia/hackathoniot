package table

import "time"

type User struct {
	Id        *uint64 `gorm:"primaryKey"`
	Oid       *string `gorm:"type:VARCHAR(255); index:idx_user_oid,unique; not null"`
	Firstname *string `gorm:"type:VARCHAR(255); not null"`
	Lastname  *string `gorm:"type:VARCHAR(255); not null"`
	Email     *string `gorm:"type:VARCHAR(255); index:idx_user_email,unique; not null"`
	Role      *string `gorm:"type:VARCHAR(10); not null; default:'std'; check:role in ('admin', 'std')"`
	CreatedAt *time.Time `gorm:"not null"`
	UpdatedAt *time.Time `gorm:"not null"`
}
